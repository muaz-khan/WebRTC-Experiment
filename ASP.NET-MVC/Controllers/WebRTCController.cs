/* Muaz Khan : Nov 14, 2012
 * @muazk: http://twitter.com/muazkh
 * Github: github.com/muaz-khan
 ******************************/
using System;
using System.Linq;
using System.Web.Mvc;
using WebRTCExperiment.Models;
using System.Web.WebPages;

namespace WebRTCExperiment.Controllers
{
    public class WebRTCController : Controller
    {
        public ActionResult Index()
        {
            //return RedirectPermanent("https://webrtc-experiment.appspot.com/");
            return View();
        }

        readonly WebRTCDataContext _db = new WebRTCDataContext();

        #region Create / Join room

        [HttpPost]
        public JsonResult CreateRoom(string ownerName, string roomName, string partnerEmail = null)
        {
            if (ownerName.IsEmpty() || roomName.IsEmpty()) return Json(false);

            back:
            string token = RandomNumbers.GetRandomNumbers();
            if (_db.Rooms.Any(r => r.Token == token)) goto back;

            back2:
            string ownerToken = RandomNumbers.GetRandomNumbers();
            if (_db.Rooms.Any(r => r.OwnerToken == ownerToken)) goto back2;

            var room = new Room
            {
                Token = token,
                Name = roomName.GetValidatedString(),
                OwnerName = ownerName.GetValidatedString(),
                OwnerToken = ownerToken,
                LastUpdated = DateTime.Now,
                SharedWith = partnerEmail.IsEmpty() ? "Public" : partnerEmail,
                Status = Status.Available
            };

            _db.Rooms.InsertOnSubmit(room);
            _db.SubmitChanges();

            return Json(new
            {
                roomToken = room.Token,
                ownerToken = room.OwnerToken
            });
        }

        [HttpPost]
        public JsonResult JoinRoom(string participant, string roomToken, string partnerEmail = null)
        {
            if (participant.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var room = _db.Rooms.FirstOrDefault(r => r.Token == roomToken);
            if (room == null) return Json(false);

            if (room.SharedWith != "Public")
            {
                if (partnerEmail.IsEmpty()) return Json(false);
                if (room.SharedWith != partnerEmail) return Json(false);
            }

            back:
            string participantToken = RandomNumbers.GetRandomNumbers();
            if (_db.Rooms.Any(r => r.OwnerToken == participantToken)) goto back;

            room.ParticipantName = participant.GetValidatedString();
            room.ParticipantToken = participant;
            room.LastUpdated = DateTime.Now;
            room.Status = Status.Active;

            _db.SubmitChanges();

            return Json(new
            {
                participantToken,
                friend = room.OwnerName
            });
        }

        #endregion

        #region Search rooms

        [HttpPost]
        public JsonResult SearchPublicRooms(string partnerEmail)
        {
            if (!partnerEmail.IsEmpty()) return SearchPrivateRooms(partnerEmail);

            var rooms = _db.Rooms.Where(r => r.SharedWith == "Public" && r.Status == Status.Available && r.LastUpdated.AddMinutes(1) > DateTime.Now).OrderByDescending(o => o.ID);
            return Json(
                new
                    {
                        rooms = rooms.Select(r => new
                                                      {
                                                          roomName = r.Name,
                                                          ownerName = r.OwnerName,
                                                          roomToken = r.Token
                                                      }),
                        availableRooms = rooms.Count(),
                        publicActiveRooms= _db.Rooms.Count(r => r.Status == Status.Active && r.LastUpdated.AddMinutes(1) > DateTime.Now && r.SharedWith == "Public"),
                        privateAvailableRooms = _db.Rooms.Count(r => r.Status == Status.Available && r.LastUpdated.AddMinutes(1) > DateTime.Now && r.SharedWith != "Public")
                    }
                );
        }

        [HttpPost]
        public JsonResult SearchPrivateRooms(string partnerEmail)
        {
            if (partnerEmail.IsEmpty()) return Json(false);

            var rooms = _db.Rooms.Where(r => r.SharedWith == partnerEmail && r.Status == Status.Available && r.LastUpdated.AddMinutes(1) > DateTime.Now).OrderByDescending(o => o.ID);
            return Json(new
                            {
                                rooms = rooms.Select(r => new
                                                              {
                                                                  roomName = r.Name,
                                                                  ownerName = r.OwnerName,
                                                                  roomToken = r.Token
                                                              })
                            });
        }

        #endregion

        #region SDP Messages

        [HttpPost]
        public JsonResult PostSDP(string sdp, string roomToken, string userToken)
        {
            if (sdp.IsEmpty() || roomToken.IsEmpty() || userToken.IsEmpty()) return Json(false);

            var sdpMessage = new SDPMessage
            {
                SDP = sdp,
                IsProcessed = false,
                RoomToken = roomToken,
                Sender = userToken
            };

            _db.SDPMessages.InsertOnSubmit(sdpMessage);
            _db.SubmitChanges();

            return Json(true);
        }

        [HttpPost]
        public JsonResult GetSDP(string roomToken, string userToken)
        {
             if (roomToken.IsEmpty() || userToken.IsEmpty()) return Json(false);

            var sdp = _db.SDPMessages.FirstOrDefault(s => s.RoomToken == roomToken && s.Sender != userToken && !s.IsProcessed);

            if(sdp == null) return Json(false);

            sdp.IsProcessed = true;
            _db.SubmitChanges();

            return Json(new
            {
                sdp = sdp.SDP
            });
        }

        #endregion

        #region ICE Candidates

        [HttpPost]
        public JsonResult PostICE(string candidate, string label, string roomToken, string userToken)
        {
            if (candidate.IsEmpty() || label.IsEmpty() || roomToken.IsEmpty() || userToken.IsEmpty()) return Json(false);

            var candidateTable = new CandidatesTable
            {
                Candidate = candidate,
                Label = label,
                IsProcessed = false,
                RoomToken = roomToken,
                Sender = userToken
            };

            _db.CandidatesTables.InsertOnSubmit(candidateTable);
            _db.SubmitChanges();

            return Json(true);
        }

        [HttpPost]
        public JsonResult GetICE(string roomToken, string userToken)
        {
            if (roomToken.IsEmpty() || userToken.IsEmpty()) return Json(false);

            var candidate = _db.CandidatesTables.FirstOrDefault(c => c.RoomToken == roomToken && c.Sender != userToken && !c.IsProcessed);
            if (candidate == null) return Json(false);

            return Json(new
            {
                candidate = candidate.Candidate,
                label = candidate.Label
            });
        }

        #endregion

        #region Extras

        [HttpPost]
        public JsonResult GetParticipant(string roomToken, string ownerToken)
        {
            if (roomToken.IsEmpty() || ownerToken.IsEmpty()) return Json(false);

            var room = _db.Rooms.FirstOrDefault(r => r.Token == roomToken && r.OwnerToken == ownerToken);
            if (room == null) return Json(false);

            room.LastUpdated = DateTime.Now;
            _db.SubmitChanges();

            if (room.ParticipantName.IsEmpty()) return Json(false);
            return Json(new { participant = room.ParticipantName });
        }

        #endregion

        #region Chat

        [HttpPost]
        public JsonResult GetChatMessage(string userToken, string roomToken)
        {
            if (userToken.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var chat = _db.Chats.FirstOrDefault(c => c.RoomToken == roomToken && c.SentBy != userToken);
            if (chat == null) return Json(false);

            var message = chat.Message.ResolveLinks();
            var by = chat.SentBy;
            var at = chat.SentAt.ToAgo(DateTime.Now);

            _db.Chats.DeleteOnSubmit(chat);

            var room = _db.Rooms.FirstOrDefault(r => r.Token == roomToken);
            if (room != null)
            {
                room.LastUpdated = DateTime.Now;

                if (room.OwnerToken == by) by = room.OwnerName;
                else by = room.ParticipantName;
            }

            _db.SubmitChanges();

            return Json(new
            {
                message,
                by,
                at
            });
        }

        [HttpPost]
        public JsonResult PostChatMessage(string userToken, string roomToken, string message)
        {
            if (userToken.IsEmpty() || message.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var chat = new Chat
            {
                Message = message.GetValidatedString(),
                SentBy = userToken,
                SentAt = DateTime.Now,
                RoomToken = roomToken
            };

            _db.Chats.InsertOnSubmit(chat);

            var room = _db.Rooms.FirstOrDefault(r => r.Token == roomToken);
            if (room != null) room.LastUpdated = DateTime.Now;

            _db.SubmitChanges();

            return Json(true);
        }

        #endregion
    }
    struct Status
    {
        public const string Available = "Available";
        public const string Active = "Active";
    }
}
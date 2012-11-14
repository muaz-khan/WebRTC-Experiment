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

        #region UI Stuff

        [HttpPost]
        public JsonResult CreateRoom()
        {
            var form = Request.Form;
            string owner = form["owner"], room = form["room"];

            if (owner.IsEmpty() || room.IsEmpty()) return Json(false);

            GoBack:
            var roomToken = RandomNumbers.GetRandomNumbers();
            if(_db.SDPMessages.Any(s => s.RoomToken == roomToken)) goto GoBack;

            var sdpMessage = new SDPMessage
            {
                IsRoomFull = false,
                Done = false,
                Users = owner,
                FromUser = owner,
                EventDate = DateTime.Now,
                Type = "Waiting",
                SDP = "",
                Room = room,
                RoomToken = roomToken
            };

            _db.SDPMessages.InsertOnSubmit(sdpMessage);
            _db.SubmitChanges();

            return Json(roomToken);
        }

        [HttpPost]
        public JsonResult JoinRoom()
        {
            var form = Request.Form;
            string you = form["you"], roomToken = form["roomToken"];

            if (you.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var sdpMessage = _db.SDPMessages.FirstOrDefault(s => s.Type == "Waiting" && s.RoomToken == roomToken && s.FromUser != you);

            if (sdpMessage == null) return Json(false);

            var otherUser = sdpMessage.FromUser;

            sdpMessage.FromUser = you;
            sdpMessage.Users += "," + you;

            _db.SubmitChanges();

            return Json(otherUser);
        }


        [HttpPost]
        public JsonResult GetFellowUser()
        {
            var form = Request.Form;
            string you = form["you"], roomToken = form["roomToken"];

            if (you.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var sdpMessage = _db.SDPMessages.FirstOrDefault(s => s.Type == "Waiting" && s.RoomToken == roomToken);

            if (sdpMessage == null) return Json(false);

            sdpMessage.EventDate = DateTime.Now;
            _db.SubmitChanges();

            if (sdpMessage.FromUser == you) return Json(false);

            return Json(sdpMessage.FromUser);
        }

        [HttpPost]
        public JsonResult GetAvailableRooms()
        {
            var form = Request.Form;
            string you = form["you"];

            var rooms = _db.SDPMessages.OrderByDescending(o => o.EventDate).Where(m => m.FromUser != you && m.Type == "Waiting" && m.EventDate.AddSeconds(10) > DateTime.Now).Take(10)
                .Select(r => new
                {
                    name = r.Room,
                    token = r.RoomToken
                }).ToList();

            return Json(rooms);
        }

        #region feedback panel
        [HttpPost]
        public JsonResult TotalFeedbacks()
        {
            return Json(_db.Feedbacks.Count());
        }

        [HttpPost]
        public JsonResult GetFeedback()
        {
            var form = Request.Form;
            int skip = int.Parse(form["skip"]), take = int.Parse(form["take"]);

            var feedbacks = _db.Feedbacks.OrderByDescending(o => o.ID).Skip(skip).Take(take).Select(feedback => new
            {
                name = feedback.Name,
                message = feedback.Message.ResolveLinks(),
                time = feedback.Date.ToAgo(DateTime.Now)
            }).ToList();

            return Json(new
            {
                feedbacks,
                hasMore = _db.Feedbacks.Count() > skip + take
            });
        }

        [HttpPost]
        public JsonResult NewFeedback()
        {
            var form = Request.Form;
            string name = form["name"], message = form["message"];

            if (name.IsEmpty() || message.IsEmpty()) return Json(false);

            var feedback = new Feedback
            {
                Name = name.GetValidatedString(),
                Message = message.GetValidatedString(),
                Date = DateTime.Now
            };
            _db.Feedbacks.InsertOnSubmit(feedback);
            _db.SubmitChanges();

            return Json(new
            {
                name = feedback.Name,
                message = feedback.Message.ResolveLinks(),
                time = feedback.Date.ToAgo(DateTime.Now)
            });
        }
        #endregion

        #endregion

        #region SDP specific stuff

        [HttpPost]
        public JsonResult PostSdp()
        {
            var form = Request.Form;
            string sdp = form["sdp"], type = form["type"], you = form["you"], roomToken = form["roomToken"];

            if (sdp.IsEmpty() || type.IsEmpty() || you.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var sdpMessage = _db.SDPMessages.FirstOrDefault(s => s.RoomToken == roomToken);
            if (sdpMessage == null) return Json(false);

            sdpMessage.SDP = sdp;
            sdpMessage.Type = type;
            sdpMessage.FromUser = you;

            _db.SubmitChanges();

            return Json(true);
        }

        [HttpPost]
        public JsonResult GetSdp()
        {
            var form = Request.Form;
            string you = form["you"], roomToken = form["roomToken"];

            if (you.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var sdpMessage = _db.SDPMessages.FirstOrDefault(s => s.RoomToken == roomToken && s.FromUser != you);

            if (sdpMessage == null) return Json(false);

            sdpMessage.Done = true;

            return Json(sdpMessage.SDP);
        }

        #endregion

        #region ICE specific stuff

        public JsonResult PostCandidate()
        {
            var form = Request.Form;
            string you = form["you"], roomToken = form["roomToken"], candidate = form["candidate"], label = form["label"];

            var candidateTable = new CandidatesTable
            {
                Room = roomToken,
                FromUser = you,
                Candidate = candidate,
                Label = label,
                Done = false,
                EventDate = DateTime.Now
            };

            _db.CandidatesTables.InsertOnSubmit(candidateTable);
            _db.SubmitChanges();

            return Json(true);
        }

        public JsonResult GetCandidate()
        {
            var form = Request.Form;
            string you = form["you"], roomToken = form["roomToken"];

            var candidate = _db.CandidatesTables.FirstOrDefault(c => c.Room == roomToken && c.FromUser != you && !c.Done);

            if (candidate != null)
            {
                candidate.Done = true;
                _db.SubmitChanges();

                return Json(new
                {
                    candidate = candidate.Candidate,
                    label = candidate.Label,
                    id = candidate.ID
                });
            }

            return Json(false);
        }

        #endregion
    }
}
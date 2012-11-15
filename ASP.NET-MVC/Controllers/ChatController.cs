using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.WebPages;
using WebRTCExperiment.Models;

namespace WebRTCExperiment.Controllers
{
    public class ChatController : Controller
    {
        ChatDataContext db = new ChatDataContext();

        [HttpPost]
        public JsonResult Get()
        {
            var form = Request.Form;

            string me = form["me"],
                   roomToken = form["roomToken"];

            //if (me.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var chat = db.Chats.FirstOrDefault(c => c.RoomToken == roomToken && c.SentBy != me);
            if (chat == null) return Json(false);

            string message = chat.Message.ResolveLinks();
            string by = chat.SentBy;
            string at = chat.SentAt.ToAgo(DateTime.Now);

            db.Chats.DeleteOnSubmit(chat);
            db.SubmitChanges();

            return Json(new
            {
                message,
                by,
                at
            });
        }

        [HttpPost]
        public JsonResult Post()
        {
            var form = Request.Form;
            
            string me = form["me"],
                   message = form["message"],
                   roomToken = form["roomToken"];

            //if (me.IsEmpty() || message.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var chat = new Chat
            {
                Message = message.GetValidatedString(),
                SentBy = me,
                SentAt = DateTime.Now,
                RoomToken = roomToken
            };

            db.Chats.InsertOnSubmit(chat);
            db.SubmitChanges();

            return Json(true);
        }
    }
}

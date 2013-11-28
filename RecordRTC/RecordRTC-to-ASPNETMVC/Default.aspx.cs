using System.Web;
using System.Web.Mvc;
using System.Web.UI;

namespace RecordRTC_to_ASPNETMVC
{
    public partial class Default : Page // a workaround for IIS6  (i.e. versions lower than IIS7)
    {
        public void Page_Load(object sender, System.EventArgs e)
        {
            if (Request.ApplicationPath != null) HttpContext.Current.RewritePath(Request.ApplicationPath, false);
            IHttpHandler httpHandler = new MvcHttpHandler();
            httpHandler.ProcessRequest(HttpContext.Current);
        }
    }
}

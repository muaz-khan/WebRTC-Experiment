using System.Text.RegularExpressions;

namespace WebRTCExperiment
{
    /* These extension methods are just for feedback panel! */
    public static class TempExtensions
    {
        public static string GetValidatedString(this string text)
        {
            return text.Replace("-equal", "=").Replace("_plus_", "+").Replace("--", " ").Replace("-qmark", "?").Replace("-nsign", "#").Replace("-n", " <br />").Replace("-lt", "&lt;").Replace("-gt", "&gt;").Replace("-amp", "&").Replace("__", "-");
        }

        public static string ResolveLinks(this string body)
        {
            if (string.IsNullOrEmpty(body)) return body;

            const string regex = @"((www\.|(http|https|ftp|news|file)+\:\/\/)[&#95;.a-z0-9-]+\.[a-z0-9\/&#95;:@=.+?,##%&~-]*[^.|\'|\# |!|\(|?|,| |>|<|;|\)])";
            var r = new Regex(regex, RegexOptions.IgnoreCase);

            body = r.Replace(body, "<a href=\"$1\" title=\"$1\" target=\"_blank\">$1</a>").Replace("href=\"www", "href=\"http://www");

            return body;
        }
    }
}
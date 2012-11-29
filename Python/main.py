import webapp2
import os
from datetime import date

pubKey = 'demo'
subKey = 'demo'

class MainHandler(webapp2.RequestHandler):
    def get(self):
        Index = openFile('index.html')
        PubNub = openFile('pubnub.js')
        html = Index.replace('{year}', str(date.today().year))\
               .replace('{pubnub-js}', PubNub)
        self.response.out.write(html)  

#-----------------------------------------------
def openFile(file):
    file = 'files/' + file
    
    if os.path.exists(file):
        output = ''

        with open(file) as f:
            for line in f:
                output += line
                
        return output

#-----------------------------------------------
class RulesHandler(webapp2.RequestHandler):
    def get(self):
        Index = openFile('rules.html')
        StyleSheet = openFile('aspnet-mvc/StyleSheet.css')
        
        html = Index.replace('{year}', str(date.today().year))\
               .replace('{StyleSheet}', StyleSheet)
        
        self.response.out.write(html)


#-----------------------------------------------
class AspNetMVCHandler(webapp2.RequestHandler):
    def get(self):
        folderURL = 'aspnet-mvc/'
        Index = openFile(folderURL + 'ASP.NET-MVC-Oriented-WebRTC-Experiment.html')
        StyleSheet = openFile(folderURL + 'StyleSheet.css')

        PubNub = openFile('pubnub.js')
        
        MiniJQuery = openFile(folderURL + 'mini-jquery.js')
        WebRTC = openFile(folderURL + 'WebRTC.js')
        UI = openFile(folderURL + 'UI.js')

        JavaScript = MiniJQuery + WebRTC + UI
        
        html = Index.replace('{year}', str(date.today().year))\
               .replace('{pubnub-js}', PubNub)\
               .replace('pub-key="demo"', 'pub-key="'+ pubKey + '"')\
               .replace('sub-key="demo"', 'sub-key="'+ subKey + '"')\
               .replace('{StyleSheet}', StyleSheet)\
               .replace('{JavaScript}', JavaScript)
        
        self.response.out.write(html)


#-----------------------------------------------
class JavaScriptHandler(webapp2.RequestHandler):
    def get(self):
        Index = openFile('javascript/JavaScript-Only-WebRTC-Experiment.html')
        PubNub = openFile('pubnub.js')
        html = Index.replace('{year}', str(date.today().year))\
               .replace('{pubnub-js}', PubNub)\
               .replace('pub-key="demo"', 'pub-key="'+ pubKey + '"')\
               .replace('sub-key="demo"', 'sub-key="'+ subKey + '"')
        self.response.out.write(html)

#-----------------------------------------------        
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/rules/', RulesHandler),
    ('/aspnet-mvc/', AspNetMVCHandler),
    ('/javascript/', JavaScriptHandler)
    ])
        

import webapp2
import os
from datetime import date

class MainHandler(webapp2.RequestHandler):
    def get(self):
        Index = openFile('index.html')

        MiniJQuery = openFile('mini-jquery.js')
        WebRTC = openFile('WebRTC.js')
        UI = openFile('UI.js')

        JavaScript = MiniJQuery + WebRTC + UI
        
        StyleSheet = openFile('StyleSheet.css')
        
        html = Index.replace('{year}', str(date.today().year))\
               .replace('{StyleSheet}', StyleSheet)\
               .replace('{JavaScript}', JavaScript)
        
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
        StyleSheet = openFile('StyleSheet.css')
        
        html = Index.replace('{year}', str(date.today().year))\
               .replace('{StyleSheet}', StyleSheet)
        
        self.response.out.write(html)

#-----------------------------------------------        
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/rules/', RulesHandler)
    ])
        

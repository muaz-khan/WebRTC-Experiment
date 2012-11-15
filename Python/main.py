import webapp2
import os
from datetime import date

class MainHandler(webapp2.RequestHandler):
    def get(self):
        webrtc = self.request.get('webrtc')

        Index = openFile('index.html')
        JavaScript = openFile('JavaScript%s.js' % webrtc)
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
        self.response.out.write(openFile('rules.html').replace('{year}', str(date.today().year)))

#-----------------------------------------------        
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/rules/', RulesHandler)
    ])
        

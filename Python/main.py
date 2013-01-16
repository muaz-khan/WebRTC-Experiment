import webapp2
import os
from datetime import date

pubKey = 'demo'
subKey = 'demo'

# global_stun = '{ "iceServers": [{ "url": "stun:www.stunserver.org" }] }'
global_stun = '{ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] }'
global_turn = '{ "iceServers": [{ "url": "turn:webrtc%40live.com@numb.viagenie.ca", "credential": "muazkh" }] }'

class MainHandler(webapp2.RequestHandler):
    def get(self):
        Title = 'WebRTC Experiment'
        Description = Title+ ': Real-time working WebRTC demos. Share your audio/video streams using the power of WebRTC! Pubnub/JavaScript Only WebRTC Experiments!'
        Canonical = '/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('index.html')

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------
def openFile(file):
    file = 'files/' + file
    
    if os.path.exists(file):
        output = ''

        with open(file) as f:
            for line in f:
                output += line
                
        return output.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

#-----------------------------------------------
class RulesHandler(webapp2.RequestHandler):
    def get(self):
        self.redirect('/', True)


#-----------------------------------------------
class AspNetMVCHandler(webapp2.RequestHandler):
    def get(self):
        folderURL = 'aspnet-mvc/'
        Index = openFile(folderURL + 'ASP.NET-MVC-Oriented-WebRTC-Experiment.html')
        
        html = Index.replace('{year}', str(date.today().year))\
               .replace('pub-key="demo"', 'pub-key="'+ pubKey + '"')\
               .replace('sub-key="demo"', 'sub-key="'+ subKey + '"')
        
        self.response.out.write(html)


#-----------------------------------------------
class JavaScriptHandler(webapp2.RequestHandler):
    def get(self):

        self.redirect('/broadcast/', True)

#-----------------------------------------------
class SocketIOHandler(webapp2.RequestHandler):
    def get(self):

        Title = '(Socket.io/Pubnub/JavaScript) WebRTC Experiment'
        Description = Title + ': WebRTC Experiment that uses Socket.io over Pubnub for signaling to make a realtime handshake! It is reliable and faster as compare to traditional XHR model! You can say it JavaScript only WebRTC Experiment because you don\'t need to understand any server side language or technology. It doesn\'t require any Node.JS backend! Just JavaScript knowledge is enough!'
        Canonical = '/socket.io/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('socket.io/Socket-IO-WebRTC-Experiment.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------
class WebSocketHandler(webapp2.RequestHandler):
    def get(self):

        Title = '(WebSocket/Pubnub/JavaScript) WebRTC Experiment'
        Description = Title + ': WebRTC Experiment that uses WebSocket over Pubnub for signaling to make a realtime handshake! It is reliable and faster. It is a JavaScript only WebRTC Experiment because you don\'t need to understand any server side language or technology. It doesn\'t require any server side installation! Just JavaScript knowledge is enough!'
        Canonical = '/websocket/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('websocket/WebSocket-WebRTC-Experiment.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)


#-----------------------------------------------
class BroadcastHandler(webapp2.RequestHandler):
    def get(self):

        Title = 'WebRTC Video/Stream Broadcasting'
        Description = Title + ': WebRTC video/stream broadcasting experiment. It uses socket.io multiplexing over PubNub for signaling and allows you broadcast video over many peers. There is no limitation!!!'
        Canonical = '/broadcast/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('broadcast/WebRTC-Video-Broadcast-Experiment.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------
class ScreenBroadcastHandler(webapp2.RequestHandler):
    def get(self):

        Title = 'WebRTC Screen Broadcasting'
        Description = Title + ': WebRTC screen broadcasting: Using Chrome tabCapture APIs to broadcast screen over many peers.'
        Canonical = '/screen-broadcast/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('screen-broadcast/WebRTC-Screen-Broadcasting-Experiment.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------
class HowToInstallHandler(webapp2.RequestHandler):
    def get(self):
        Title = 'How to install tabCapture extension?'
        Description = Title + ': This guide explains how to install tabCapture extension on Google Chrome canary to broadcast your screen over many peers.'
        Canonical = '/screen-broadcast/how-to-install/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('screen-broadcast/how-to-install-tabCapture-extension.html')
        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

        
#-----------------------------------------------
class AudioBroadcastHandler(webapp2.RequestHandler):
    def get(self):

        Title = 'WebRTC Audio/Voice Broadcasting'
        Description = Title + ': WebRTC audio/voice broadcasting experiment. It uses socket.io multiplexing over PubNub for signaling and allows you broadcast video over many peers. There is no limitation!!!'
        Canonical = '/audio-broadcast/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('audio-broadcast/WebRTC-Audio-Broadcast-Experiment.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------
class CallsHandler(webapp2.RequestHandler):
    def get(self):

        Title = 'Realtime Plugin-free calls'
        Description = Title + ': Allow your visitors to call you directly. No flash! No Plugin. A realtime calling method for everyone!'
        Canonical = '/calls/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('calls/Realtime-PluginFree-Calls.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------
class HowHandler(webapp2.RequestHandler):
    def get(self):
        Title = 'How to use RTCPeerConnection.js? WebRTC Guide'
        Description = Title + ": How to use RTCPeerConnection.js? WebRTC Guide: This guide explains 'How to write WebRTC code?'....'How to order WebRTC code'....'How to use RTCPeerConnection.js'....the easiest way to learn and use WebRTC!"
        Canonical = '/howto/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('howto/how-to-use-rtcpeerconnection-js.html')
        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------
class HowToBroadcastScreenHandler(webapp2.RequestHandler):
    def get(self):
        Title = 'How to broadcast/share screen using WebRTC?'
        Description = Title + ': This document explains how to broadcast/share your screen over many peers using Google Chrome tabCapture extension APIs.'
        Canonical = '/howto/broadcast-screen/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('howto/How-to-Broadcast-Screen-using-WebRTC.html')
        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------
class StatisticsHandler(webapp2.RequestHandler):
    def get(self):
        Title = 'Realtime Statistics'
        Description = Title + ': Realtime Statistics for all WebRTC Experiments & Demos!'
        Canonical = '/statistics/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('statistics.html')
        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

class ContactHandler(webapp2.RequestHandler):
    def get(self):
        Title = 'Have any message for Muaz Khan?'
        Description = Title+ ': Contact Muaz Khan for issues, bugs, and feedback.'
        Canonical = '/issues-messages-requests-feedback-contact/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('contact.html')

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

class SiteMapHandler(webapp2.RequestHandler):
    def get(self):
        month = date.today().month
        
        if month < 10:
            month = '0' + str(month)
            
        day = date.today().day

        if day < 10:
            day = '0' + str(day)

            
        year = date.today().year
        SiteMap = openFile('sitemap.xml')\
                 .replace('{year}', str(year))\
                 .replace('{month}', str(month))\
                 .replace('{day}', str(day))

        self.response.headers['Content-Type'] = 'text/xml'
        
        self.response.out.write(SiteMap)

class ChatHandler(webapp2.RequestHandler):
    def get(self):

        Title = 'Realtime Chat using RTCWeb DataChannel APIs!'
        Description = Title + ': A simple chat application uses WebRTC DataChannel APIs to transmit text message.'
        Canonical = '/chat/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('chat/WebRTC-Chat-using-DataChannel.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

class FileBroadcastHandler(webapp2.RequestHandler):
    def get(self):

        Title = 'File Broadcast using RTCDataChannel APIs'
        Description = Title + ': Share your files using WebRTC RTCDataChannel APIs. Broadcast files over many peers (browser to browser) using purse RTCWeb DataChannel APIs.'
        Canonical = '/file-broadcast/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('file-broadcast/p2p-share-file-broadcast.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('{publish_key}', pubKey)\
               .replace('{subscribe_key}', subKey)

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

#-----------------------------------------------        
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/sitemap.xml', SiteMapHandler),
    ('/rules/', RulesHandler),
    ('/aspnet-mvc/', AspNetMVCHandler),
    ('/javascript/', JavaScriptHandler),
    ('/socket.io/', SocketIOHandler),
    ('/websocket/', WebSocketHandler),
    ('/broadcast/', BroadcastHandler),
    ('/audio-broadcast/', AudioBroadcastHandler),
    ('/calls/', CallsHandler),
    ('/screen-broadcast/', ScreenBroadcastHandler),
    ('/screen-broadcast/how-to-install/', HowToInstallHandler),
    ('/howto/', HowHandler),
    ('/howto/broadcast-screen/', HowToBroadcastScreenHandler),
    ('/statistics/', StatisticsHandler),
    ('/issues-messages-requests-feedback-contact/', ContactHandler),
    ('/chat/', ChatHandler),
    ('/file-broadcast/', FileBroadcastHandler)
    ])
        

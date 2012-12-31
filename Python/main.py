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
        Title = 'WebRTC Experiment Rules/Privacy'
        Description = Title + ': Real-time working WebRTC demos. Share your audio/video streams using the power of WebRTC! Pubnub/JavaScript Only WebRTC Experiments!'
        Canonical = '/rules/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('rules.html')

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)


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

        Title = '(Pubnub/JavaScript) WebRTC Experiment'
        Description = Title + ': WebRTC Experiment that uses Pubnub for signaling to make a realtime handshake! It is reliable and faster as compare to traditional XHR model! You can say it JavaScript only WebRTC Experiment because you don\'t need to understand any server side language or technology. Just JavaScript knowledge is enough!'
        Canonical = '/javascript/'
        
        Common = openFile('common.html')\
                 .replace('{title}', Title)\
                 .replace('{description}', Description)\
                 .replace('{canonical}', Canonical)
        
        Body = openFile('javascript/JavaScript-Only-WebRTC-Experiment.html')

        turn = self.request.get('turn')
        if turn:
            Body = Body.replace('"{stun-turn}"', global_turn)
        else:
            Body = Body.replace('"{stun-turn}"', global_stun)

        Body = Body.replace('pub-key="demo"', 'pub-key="'+ pubKey + '"')\
               .replace('sub-key="demo"', 'sub-key="'+ subKey + '"')

        Common = Common.replace('{body}', Body)\
                 .replace('{year}', str(date.today().year))
        
        self.response.out.write(Common)

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
        Description = Title + ': WebRTC screen broadcasting: Using Chrome Experimental tabCapture APIs to broadcast screen over many peers.'
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
class HowHandler(webapp2.RequestHandler):
    def get(self):
        Title = 'How to use RTCPeerConnection.js? WebRTC Guide'
        Description = Title + ': This guide explains "How to write WebRTC code?"...."How to order WebRTC code"...."How to use RTCPeerConnection.js"....the easiest way to learn and use WebRTC!'
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
        
#-----------------------------------------------        
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/rules/', RulesHandler),
    ('/aspnet-mvc/', AspNetMVCHandler),
    ('/javascript/', JavaScriptHandler),
    ('/socket.io/', SocketIOHandler),
    ('/websocket/', WebSocketHandler),
    ('/broadcast/', BroadcastHandler),
    ('/audio-broadcast/', AudioBroadcastHandler),
    ('/screen-broadcast/', ScreenBroadcastHandler),
    ('/screen-broadcast/how-to-install/', HowToInstallHandler),
    ('/howto/', HowHandler),
    ('/statistics/', StatisticsHandler)
    ])
        

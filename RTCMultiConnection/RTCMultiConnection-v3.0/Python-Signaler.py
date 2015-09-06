# its a work in-progress
# please don't use it.

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.websocket
import json

listOfUsers = {}
shiftedModerationControls = {}
numberOfPasswordTries = 0
closed = False

class User:
    def __init__(self):
        self.extra = {}
        self.isPublic = False
        self.connectedWith = {}
        self.socket = {}
        self.password = ''
        

class TornadoWebSocketsHandler(tornado.websocket.WebSocketHandler):
    def check_origin(socket, origin):
        return True

    def emit(socket, eventName, message):
        if closed == True:
            return

        socket.write_message(json.dumps({
            'eventName': eventName,
            'data': message
        }))

    def open(socket, userid, socketMessageEvent):
        if closed == True:
            return

        print('---------------')
        print(userid, socketMessageEvent)
        print('---------------')

        socket.userid = userid
        socket.socketMessageEvent = socketMessageEvent

        listOfUsers[socket.userid] = User()
        listOfUsers[socket.userid].socket = socket

    def onMessageCallback(socket, message):
        if not listOfUsers[message['sender']]:
            print('user-not-exists', message['sender'])
            return

        remoteUserId = ''
        if 'remoteUserId' in message:
            remoteUserId = message['remoteUserId']

        if not listOfUsers[message['sender']].connectedWith[remoteUserId] and listOfUsers[remoteUserId]:
            listOfUsers[message['sender']].connectedWith[remoteUserId] = listOfUsers[remoteUserId].socket;
            listOfUsers[message['sender']].socket.emit('user-connected', remoteUserId)

        if not listOfUsers[remoteUserId]:
            listOfUsers[remoteUserId] = User()
            listOfUsers[remoteUserId].connectedWith[message['sender']] = socket

        if listOfUsers[message['sender']].connectedWith[remoteUserId] and listOfUsers[socket.userid]:
            message['extra'] = listOfUsers[socket.userid].extra
            listOfUsers[message['sender']].connectedWith[remoteUserId].emit(socket.socketMessageEvent, message)

    def on_message(socket, message):
        if closed == True:
            return

        message = json.loads(message)

        print('-----------')
        print(message)
        print('----------')

        eventName = message['eventName']

        if 'data' in message:
            message = message['data']

        remoteUserId = ''
        if 'remoteUserId' in message:
            remoteUserId = message['remoteUserId']

        innerMessage = ''
        if 'message' in message:
            innerMessage = message['message']

        if not 'extra' in message:
            message['extra'] = {}

        if eventName == 'become-a-public-user':
            if listOfUsers[socket.userid]:
                listOfUsers[socket.userid].isPublic = True

        if eventName == 'extra-data-updated':
            if listOfUsers[socket.userid] and 'extra' in message:
                listOfUsers[socket.userid].extra = message['extra']

                for user in listOfUsers[socket.userid].connectedWith:
                    listOfUsers[user].socket.emit('extra-data-updated', [socket.userid, message['extra']])

        if eventName == 'changed-uuid':
            if listOfUsers[socket.userid]:
                oldUserId = socket.userid
                listOfUsers[message['uuid']] = listOfUsers[oldUserId]
                listOfUsers[message['uuid']].socket.userid = socket.userid = message['uuid']
                del listOfUsers[oldUserId]
                return

            socket.userid = message['uuid']
            listOfUsers[socket.userid] = User()
            listOfUsers[socket.userid].socket = socket

        if eventName == 'set-password':
            if listOfUsers[socket.userid]:
                listOfUsers[socket.userid].password = message['password']

        if eventName == 'disconnect-with':
            
            if listOfUsers[socket.userid]:
                if listOfUsers[socket.userid].connectedWith[remoteUserId]:
                    del listOfUsers[socket.userid].connectedWith[remoteUserId]
                    socket.emit('user-disconnected', remoteUserId)

            if listOfUsers[remoteUserId]:
                if listOfUsers[remoteUserId].connectedWith[socket.userid]:
                    del listOfUsers[remoteUserId].connectedWith[socket.userid]
                    listOfUsers[remoteUserId].socket.emit('user-disconnected', socket.userid)

        if eventName == socket.socketMessageEvent:
            if remoteUserId and not remoteUserId == 'system' and 'newParticipationRequest' in innerMessage:
                if remoteUserId in listOfUsers and listOfUsers[remoteUserId].password:
                    if numberOfPasswordTries > 3:
                        socket.emit('password-max-tries-over', remoteUserId)
                        return

                    if not 'password' in message or message['password'] == False:
                        numberOfPasswordTries += 1
                        socket.emit('join-with-password', remoteUserId)
                        return

                    if not message['password'] == listOfUsers[remoteUserId].password:
                        numberOfPasswordTries += 1
                        socket.emit('invalid-password', [remoteUserId, message['password']])
                        return

            if 'shiftedModerationControl' in innerMessage:
                if 'firedOnLeave' in innerMessage and innerMessage['firedOnLeave'] == False:
                    socket.onMessageCallback(message)
                    return

                shiftedModerationControls[message['sender']] = message
                return

            if remoteUserId == 'system':
                if innerMessage['detectPresence']:
                    # callback(listOfUsers[innerMessage.userid], innerMessage.userid)
                    return

                if innerMessage['getPublicUsers']:
                    allPublicUsers = []
                    for user in listOfUsers:
                        if listOfUsers[user].isPublic:
                            allPublicUsers.append(user)

                    # callback(allPublicUsers)
                    return


            if not listOfUsers[message['sender']]:
                listOfUsers[message['sender']] = User()
                listOfUsers[message['sender']].socket = socket

            socket.onMessageCallback(message)

            # if someone tries to join a person who is absent
            if not listOfUsers[message['sender']].connectedWith[remoteUserId] and 'newParticipationRequest' in innerMessage:
                waitFor = 120 # 2 minuts
                invokedTimes = 0

                # not: setTimeout having complex equivlents in python
                # so skipping this block for now.

        if eventName == 'changed-uuid':
            oldUserId = message['oldUserId']
            newUserId = message['newUserId']
            if listOfUsers[oldUserId]:
                listOfUsers[newUserId] = listOfUsers[oldUserId]
                del listOfUsers[oldUserId]
                listOfUsers[newUserId].socket.userid = newUserId
                socket.userid = newUserId


    def on_close(socket):
        print("websocket closed")

        #inform all connected users
        if socket.userid in listOfUsers:
            for s in listOfUsers[socket.userid].connectedWith:
                listOfUsers[socket.userid].connectedWith[s].emit('user-disconnected', socket.userid)

                if listOfUsers[s] and listOfUsers[s].connectedWith[socket.userid]:
                    del listOfUsers[s].connectedWith[socket.userid]
                    listOfUsers[s].socket.emit('user-disconnected', socket.userid)

        if 'message' in shiftedModerationControls:
            message = shiftedModerationControls[socket.userid]
            socket.onMessageCallback(message)
            del shiftedModerationControls[message['userid']]

        if socket.userid in listOfUsers:
            del listOfUsers[socket.userid]

class IndexHandler(tornado.web.RequestHandler):
    def get(socket):
        socket.render('demos/index.html')

application = tornado.web.Application([
    (r'/', IndexHandler),
    (r"/signaler/(.*)/(.*)", TornadoWebSocketsHandler),
    (r"/(.*)", tornado.web.StaticFileHandler, {"path":"./"}),
])

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(9001)
    tornado.ioloop.IOLoop.instance().start()

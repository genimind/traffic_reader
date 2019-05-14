import os.path
import requests
from datetime import datetime

from bottle import Bottle, run
from bottle import get, post, route, request
from bottle import static_file


# app = Bottle()

@get('/')
def get_main():
    print('getting index.html')
    return static_file('index.html', root='./public')

@route('<filepath:path>')
def get_static(filepath = 'index.html'):
    print('getting ...', filepath)
    return static_file(filepath, root='./public')

# @route('/css/<filepath:path>')
# def get_static(filepath = 'index.html'):
#     print('getting ...', filepath)
#     return static_file(filepath, root='./public/css')

@get('/hello')
def hello():
    return "Hello World!"

@get('/photo')
def get_image():
    cam = request.query.cam
    id = request.query.id
    print('fetching image for cam:', cam, 'and id:', id)
    url = 'http://traffic.ottawa.ca/opendata/camera?c={}&certificate=mallasfels212171023451&id={}'.format(cam, id)
    print('url:', url)
    r = requests.get(url)
    filename = 'camera_{}_id_{}__{}.png'.format(cam, id, datetime.now().strftime('%Y-%m-%d__%H_%M_%S'))

    if r.status_code == 200:
        # store the file locally
        with open(os.path.join('./public', 'data', filename), 'wb') as f:
            f.write(r.content)
    # print(r.headers)
    return {'filename':os.path.join('data', filename)}

@post('/results')
def post_results():
    print('...in... post_results')
    res = request.json
    print('GOT: ', res)
    for x in res:
        print('res:', x['rowId'], '-', x['t1'], ', ', x['t2'])
    return 'OK'

run(host='localhost', port=8081, debug=True)

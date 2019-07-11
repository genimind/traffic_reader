import os.path
import requests
from datetime import datetime

from bottle import Bottle, run
from bottle import get, post, route, request
from bottle import static_file


# app = Bottle()

@route('/')
def get_main(filepath = 'index.html'):
    print('getting ', filepath)
    return static_file(filepath, root='./public')

@route('/<filepath:path>')
def get_static(filepath):
    print('getting (1) ...', filepath)
    return static_file(filepath, root='./public')

# @route('css/<filepath:path>')
# def get_static(filepath):
#     print('getting ...', filepath)
#     return static_file(filepath, root='./public/css')

@get('/hello')
def hello():
    return "Hello World!"

@route('/photo')
def get_image():
    cam = request.query.cam
    id = request.query.id
    print('fetching image for cam:', cam, 'and id:', id)
    url = 'http://traffic.ottawa.ca/opendata/camera?c={}&certificate=mallasfels212171023451&id={}'.format(cam, id)
    print('url:', url)
    r = requests.get(url)
    filename = 'camera_{}_id_{}__{}.png'.format(cam, id, datetime.now().strftime('%Y-%m-%d__%H_%M_%S'))
    filename = os.path.join('data', filename)
    # it seems that we do get a good status_code but the content is just a '{"error":-1}'
    if r.status_code == 200:
        # store the file locally
        if len(r.content) < 20:
            filename = os.path.join('icons', 'unavailable.png')
        else:
            with open(os.path.join('./public', filename), 'wb') as f:
                f.write(r.content)
    else:
        print('error getting image. status_code:', r.status_code)
    # print(r.headers)
    return {'filename':filename}

@post('/results')
def post_results():
    print('...in... post_results')
    res = request.json
    print('GOT: ', res)
    for x in res:
        print('res:', x['rowId'], '-', x['t1'], ', ', x['t2'])
    return 'OK'

run(host='localhost', port=8081, debug=True)

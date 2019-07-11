
const host = 'traffic.ottawa.ca';
const font = "10px sans-serif";

cur_camNumber = 7
var server_url = null

function doRefresh() {
    var modalImg = document.getElementById("img01");

    id = 20 + Math.floor(Math.random() * 71543);
    id = id.toString(16);
    console.log('cur_id:', id)
    var image = new Image();
    fetch_image(cur_camNumber, id, image)  
}

function doObjectDetection1() {
    var modalCanvas = document.getElementById("canvas01");
    // var canvasData = modalCanvas.toDataURL("image/png");
    // detect objects in the image.
    document.cocoModel.detect(modalCanvas).then(
        predictions => {
            const ctx = modalCanvas.getContext("2d");
            ctx.font = font;
            ctx.textBaseline = "top";

            predictions.forEach(prediction => {
                const x = prediction.bbox[0];
                const y = prediction.bbox[1];
                const width = prediction.bbox[2];
                const height = prediction.bbox[3];

                ctx.strokeStyle = "#00FFFF";
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, width, height);
                
                // Draw the label background.
                ctx.fillStyle = "#00FFFF";
                const textWidth = ctx.measureText(prediction.class).width;
                const textHeight = parseInt(font, 10); // base 10
                ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
            });
            predictions.forEach(prediction => {
                const x = prediction.bbox[0];
                const y = prediction.bbox[1];
                // Draw the text last to ensure it's on top.
                ctx.fillStyle = "#000000";
                ctx.fillText(prediction.class, x, y);
            });
        }        
    )

}

function cropToCanvas(image) {

    var canvas = document.getElementById("canvas01");
    var ctx = canvas.getContext("2d");

    image.onload = function() {
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;
        writeToStatus(`Image: (${naturalWidth},${naturalHeight})`)

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(image, 10, 10)
    }
};

function fetch_image(cam, id, image) {
    fetch(server_url+'/photo?cam='+cam+'&id='+id)
    .then(
      function(response) {
        if (response.status != 200) {
          writeToStatus('Error requesting data. Status Code: ' + response.status)
          return
        }
        // get the data
        response.json().then(function(data) {
          //console.log('GOT: ', data)
          image.src = data.filename;
          cropToCanvas(image)
        })
      }
    )
    .catch(function(err) {
      writeToStatus('Fetch err : -S', err)
    })
}

function display_image(camNumber, camType, camName) {

    //var clickedMarker = event.layer;
    // do some stuff…
    var modal = document.getElementById('myModal');
    var captionText = document.getElementById("caption");
    
    writeToStatus(`reading camera: ${camNumber}, type:${camType}, name:${camName}`)
    modal.style.display = "block";
    id = 25 + Math.floor(Math.random() * 17534);
    id = id.toString(16);

    if (camType === 'MTO')
        camNumber = camNumber + 2000

    cur_camNumber = camNumber
    
    var image = new Image();
    fetch_image(cur_camNumber, id, image)  
    // fetch(server_url+'/photo?cam='+cur_camNumber+'&id='+id)
    // .then(
    //   function(response) {
    //     if (response.status != 200) {
    //       console.log('Error requesting data. Status Code: ' + response.status)
    //       return
    //     }
    //     // get the data
    //     response.json().then(function(data) {
    //       console.log('GOT: ', data)
    //       var image = new Image();
    //       image.src = data.filename;
    //       cropToCanvas(image, modalCanvas, ctx)
    //     })
    //   }
    // )
    // .catch(function(err) {
    //   console.log('Fetch err : -S', err)
    // })

    // image.onload = function()
    // {
    //     ctx.drawImage(image, 10, 10, modalCanvas.width - 10, modalCanvas.height - 10);
    //     // var foo = Canvas2Image.saveAsPNG(modalCanvas); 
    //     console.log('saved image')
    // };
    // var img = modalCanvas.toDataURL("image/png");
    
    captionText.innerHTML = camName;

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() { 
        modal.style.display = "none";
    }
}

function display_cams(json_file, the_map) {
    var i = 0;
    //var myIcon = L.divIcon({className: 'my-div-icon'});
    var camIcon = L.icon({
        iconUrl: 'icons8-google-images-48.png',
        //shadowUrl: 'leaf-shadow.png',
    
        iconSize:     [24, 24], // size of the icon
        //shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 24], // point of the icon which will correspond to marker's location
        //shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -36] // point from which the popup should open relative to the iconAnchor
    });

    for( var i in json_file) {
        obj = json_file[i]
        //console.log('cam: (', i++, '):', obj)
        aMarker = L.marker([obj.latitude, obj.longitude], {icon: camIcon})
        aMarker.addTo(the_map)
            //.bindPopup(obj.description)
            .bindTooltip(obj.description, {offset: [-15, -20]})

        // make it hover instead of a click
        // aMarker.on('mouseover', function (e) {
        //     this.openPopup();
        // });
        // aMarker.on('mouseout', function (e) {
        //     this.closePopup();
        // });

        //.openPopup();
        aMarker.camType = obj.type
        aMarker.camNumber = obj.number
        aMarker.on("click", function (event) {
            //console.log('event:', event)
            target = event.target
            console.log('camNumber:', target.camNumber, '- camType:', target.camType)
            display_image(target.camNumber, target.camType, this._tooltip._content)
        });
    }
}
function doInit() {
    const oLat = 45.42
    const oLong = -75.69

    var mymap = L.map('mapid').setView([oLat, oLong], 13)
    
    server_url = location.origin

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);

    fetch('camera_list.json')
    .then(response => response.json())
    .then(json => display_cams(json, mymap))

    // const mLong = -75.729321
    // const mLat = 45.395966
    // L.marker([mLat, mLong]).addTo(mymap)
    //     .bindPopup('(MTO) Hwy 417 between Holland Ave and Parkdale Ave')
    //     .openPopup();

    // Load the cocoSsd model.
    document.cocoModel = cocoSsd.load()
    cocoSsd.load().then(model => {
        document.cocoModel = model
    }); 
}

function writeToStatus(text) {
    var statusText = document.getElementById('statusBox');
    statusText.value += '\n' + text;
    statusText.scrollTop = statusText.scrollHeight;
}

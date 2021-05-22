import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Table, Input } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import { API_URL } from './apiUrl.js'
import { formatTimeCallback, timeInterval, primaryLabelInterval, secondaryLabelInterval } from './formatTimeline.js'

let updateRegions = (wavesurfer, json) => {
    //Promise.resolve(wavesurfer).then((wavesurfer) => {
        if (wavesurfer !== undefined && json !== undefined) {
            wavesurfer.clearRegions();
            json.map((region, regionIdx) => {
                wavesurfer.addRegion({
                    id: regionIdx,
                    start: region.start,
                    end: region.end,
                    loop: false,
                    drag: false,
                    resize: true,
                    color: "rgba(255, 215, 0, 0.2)",
                    attributes: {
                        label: region.label,
                        new: false,
                        delete: false
                    }
                });
            });
        }
    //});
};

/*
<Audio> component

Displays waveform for a single audio file along
with various tools (minimap, zoom, annotations).

Props include:
    - file (str)
    - detailed (bool, optional)
    - annotatedRegions (Array, optional)
    - updateAnnotatedRegions (function, optional)
    - updateRegionLabel (function, optional)
*/
function Audio(props) {
    const waveformRef = useRef();
    const timelineRef = useRef();
    const closeRef = useRef();
    const sliderRef = useRef();
    const minimapRef = useRef();
    const [ zoom, setZoom ] = useState(50);
    const zoomStep = props.zoomStep || 20; // FIXME make it adaptive to file duration
    const detailedAudio = props.detailed !== undefined ? props.detailed : false;

    const waveform = useRef(undefined);
    let wavesurfer = waveform.current;

    useEffect(() => {
    async function factory () {
      const WaveSurfer = (await import('wavesurfer.js')).default
      const RegionPlugin = (await import('wavesurfer.js/dist/plugin/wavesurfer.regions.min.js')).default
      const MarkersPlugin = (await import('wavesurfer.js/dist/plugin/wavesurfer.markers.min.js')).default
      const TimelinePlugin = (await import('wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js')).default
      const CursorPlugin = (await import('wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js')).default
      const MinimapPlugin = (await import('wavesurfer.js/dist/plugin/wavesurfer.minimap.min.js')).default

      let wsPlugins = [
          RegionPlugin.create({}),
          MarkersPlugin.create({
              markers: [
                  // {
                  //     time: 5.5,
                  //     label: "V1",
                  //     color: '#ff990a'
                  // }
              ]
          }),
          TimelinePlugin.create({
              container: timelineRef.current,
              formatTimeCallback: formatTimeCallback,
              timeInterval: timeInterval,
              primaryLabelInterval: primaryLabelInterval,
              secondaryLabelInterval: secondaryLabelInterval,
                primaryColor: 'blue',
                secondaryColor: 'red',
                primaryFontColor: 'blue',
                secondaryFontColor: 'red'
          }),
          CursorPlugin.create({
              showTime: true,
              opacity: 1
          }),
      ]
      if (detailedAudio) {
          wsPlugins.push(
              MinimapPlugin.create({
                  container: detailedAudio ? minimapRef.current : undefined,
                  showOverview: true,
                  //overviewOpacity: 0.5,
                  overviewBorderSize: 0.5,
                  overviewBorderColor: 'blue',
                  waveColor: '#777',
                  progressColor: '#222',
                  height: 50
              })
          )
      }
      if(waveformRef.current) {
        console.log(waveform.current, waveform.current instanceof WaveSurfer)
        if (waveform.current instanceof WaveSurfer) {
            console.log('destroying')
            waveform.current.destroy()
        }
        let ws = WaveSurfer.create({
          container: waveformRef.current,
          barWidth: 2,
          barHeight: 1,
          barRadius: 2,
          barGap: null,
          normalize: true, // normalize by maximum peak
          waveColor: 'violet',
          progressColor: 'purple',
          mediaControls: true,
          backend: 'MediaElement',
          fillParent: true,
          plugins: wsPlugins
        });
        //setWavesurfer(ws);
        // let reader = new FileReader()
        // reader.onload = (x) => ws.load(x.target.result)
        // reader.readAsDataURL(props.file)
        ws.load(`${API_URL}${props.file}`);

        ws.enableDragSelection({
            minLength: 0.01,
            loop: false,
            drag: false,
            resize: true,
            attributes: {new: true}
        })
        ws.on('region-created', (e) => {
            console.log('e', e)
            var el = document.createElement('span');
            el.innerHTML += 'x';
            el.className = "closeButton";
            el.onclick = (event) => {event.stopPropagation(); e.remove(); e.attributes.delete = true; props.updateAnnotatedRegions(e);};

            var edit_label = document.createElement('input');
            //edit_label.style = {visibility: "hidden"};
            edit_label.type = "hidden";
            edit_label.value = e.attributes.label;
            edit_label.className = 'regionLabel inputLabel'
            edit_label.style.width = (edit_label.value.length + 5) + 'ch'
            edit_label.onclick = (event) => {
                event.stopPropagation();
            }
            edit_label.onkeypress = (event) => {
                edit_label.style.width = (edit_label.value.length + 5) + 'ch'
            }

            var label = document.createElement('span');
            label.innerHTML += e.attributes.label;
            label.className = 'regionLabel';
            label.onclick = (event) => {
                event.stopPropagation();
                console.log('click label', event, label);
                edit_label.type = "text";
                label.style.visibility = "hidden";
                edit_label.focus()
            };

            edit_label.onkeyup = (event) => {
                if (event.key === 'Enter' || event.keyCode == 13) {
                    console.log(edit_label.value)
                    props.updateRegionLabel(e.id, edit_label.value)
                    edit_label.type='hidden';
                    label.style.visibility = 'visible'
                }
            }

            e.element.appendChild(label);
            e.element.appendChild(edit_label);
            e.element.appendChild(el);
        })

        ws.on('region-update-end', (e) => {
            props.updateAnnotatedRegions(e);
        })

        ws.on('region-click', (region, event) => {
            event.stopPropagation();
            region.play();
        });

        // sliderRef.current.oninput = function (event) {
        //     ws.zoom(Number(event.target.value));
        // };

        updateRegions(ws, props.annotatedRegions);
        console.log("factory done", Object.keys(ws.regions.list))
        // return () => {
        //     ws.destroy();
        //     uppy.close();
        // }
        waveform.current = ws;

        ws.on('ready', () => {
            setZoom(Math.trunc(ws.drawer.getWidth() /ws.getDuration() / ws.params.pixelRatio));
            console.log(ws.drawer.getWidth(), ws.getDuration(), ws.params, Math.trunc(ws.drawer.getWidth() /ws.getDuration() / ws.params.pixelRatio))

        })
        //var slider = document.getElementById("myRange");
        // console.log(sliderRef)
        // sliderRef.current.onchange = (event) => {
        //     ws.getDuration()
        //     setZoom(event.target.value);
        //     console.log('zoom', event.target.value, ws.zoom, ws.params.minPxPerSec)
        //     ws.zoom(Number(event.target.value));
        // }
        // <input ref={sliderRef} type="range" min="1" max="100" defaultValue={zoom} className="slider" id="slider" />
        return () => ws.destroy();
      }
  };
  factory();
}, [props.file]);

    useEffect(() => {
        if (waveform.current !== undefined) {
            console.log('useEffect, update regions')
            updateRegions(waveform.current, props.annotatedRegions)
        }
    }, [props.annotatedRegions]);

    useEffect(() => {
        if (waveform.current !== undefined) {
            console.log('zooming max', waveform.current.getDuration() * waveform.current.params.minPxPerSec * waveform.current.params.pixelRatio)
            waveform.current.zoom(Math.max(0, zoom))
        }
    }, [zoom])

    return (
        <div style={{marginTop: 10}}>
        <div ref={timelineRef} style={{width: '100%'}}/>
        <div ref={waveformRef} style={{width: '100%', paddingTop: "1em", position: 'relative'}}>
            {detailedAudio ?
            <div style={{display: 'flex', alignItems: 'baseline', flexDirection: 'row', zIndex: 10, position: 'absolute', right: 0, top: 0}} >
                <Icon name='zoom-in' onClick={() => setZoom(prevZoom => prevZoom + zoomStep)} />
                <Icon name='zoom-out' onClick={() => setZoom(prevZoom => Math.max(prevZoom - zoomStep, 0))} />
            </div>
            : '' }
        </div>
        <div ref={minimapRef} id='minimap' style={{width: '100%'}} />

        </div>
    );
}

export default Audio

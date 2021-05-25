import { Container, Header, Icon, Grid, Form, TextArea, List, Segment,
        Button, Transition, Step, Table, Loader, Pagination, Dropdown, Search, Tab } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Fuse from 'fuse.js'
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import { API_URL } from './apiUrl.js'

const SimpleAudio = ({ src }) => {
    return (
        <AudioPlayer
            src={`${API_URL}${src}`}
            layout='horizontal'
            customControlsSection={[
                RHAP_UI.MAIN_CONTROLS
            ]}
            showJumpControls={false}
            customProgressBarSection={[ /* RHAP_UI.CURRENT_TIME */ ]}
            customIcons={{play: <Icon name='volume up'/>, pause: <Icon name='volume up' color='orange'/>}}
        />
    )
}

export default SimpleAudio

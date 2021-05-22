import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";
import Menu from '../components/menu.js'

const Layout = props => {
    return (
        <Container>
        <Menu active={props.active} />

        <Grid style={{ height: '100vh' }} verticalAlign='top' centered>
            <Head>
              <title>QBE-STD</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <Grid.Column>
                <Container text style={{paddingTop: 10}}>
                    {props.children}
                </Container>
            </Grid.Column>
        </Grid>
        </Container>
    );
}

export default Layout

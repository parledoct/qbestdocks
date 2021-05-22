import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card, Menu } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";

const CustomMenu = ({ active }) => {
    return (
        <Menu pointing secondary style={{margin: 'auto'}}>
            <Menu.Item header>Qbe-Std</Menu.Item>
            <Link href='/searches'>
                <Menu.Item
                    icon='cogs'
                    name='searches'
                    active={active == 'searches'}
                />
            </Link>
            <Link href='/audioFiles'>
            <Menu.Item
                icon='microphone'
                name='audioFiles'
                active={active == 'audioFiles'}
            />
            </Link>
            <Link href='/annotations'>
            <Menu.Item
                icon='write'
                name='annotations'
                active={active == 'annotations'}
            />
            </Link>
        </Menu>
    );
}
export default CustomMenu

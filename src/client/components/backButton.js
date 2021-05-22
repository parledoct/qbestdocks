import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";

const BackButton = () => {
    const router = useRouter()
    return (
        <Button color='blue' onClick={() => router.back()} style={{top: 10}}>
            <Icon name='left arrow' />
            Back
        </Button>
    );
}

export default BackButton

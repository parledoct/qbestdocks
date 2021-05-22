import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";

const annotationsList = ({ annotations }) => {
    return (
        <List selection>
            {annotations.map((annotation) => (
                <Link href={'/annotation/' + annotation.annot_uuid } key={annotation.annot_uuid}>
                <List.Item key={annotation.annot_uuid}>
                    <Icon name='file' />
                    {annotation.annotation}
                </List.Item>
                </Link>
            ))}
        </List>
    );
}
export default annotationsList

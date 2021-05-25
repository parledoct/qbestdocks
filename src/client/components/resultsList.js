import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Container, Header, Icon, Grid, Form, TextArea, List, Segment, Button, Transition, Step, Table, Card } from 'semantic-ui-react'
import React, { useRef, useEffect, Component, useState } from "react";

const resultsList = ({ results }) => {
    return (
        <List selection>
            {results.map((result) => (
                <List.Item key={result.result_uuid}>
                    <Icon name='file' />
                    {result.result_uuid}
                </List.Item>
            ))}
            {results.length === 0 ? <p>No search results yet.</p>: ''}
        </List>
    );
}
export default resultsList

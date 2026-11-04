import React from 'react';
import ReactDOM from 'react-dom/client';
import { Refine } from '@refinedev/core';
import { dataProvider } from './provider';
import { ADMIN_SHEETS } from './admin';
import App from './App';
import './style.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode><Refine dataProvider={dataProvider} resources={ADMIN_SHEETS.map(s=>({name:s.name}))} options={{disableTelemetry:true}}><App/></Refine></React.StrictMode>
);

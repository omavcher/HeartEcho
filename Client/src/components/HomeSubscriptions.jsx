'use client';
import { Suspense } from 'react';
import Subscriptions from './Subscriptions';

export default function HomeSubscriptions() {
  return (
    <Suspense fallback={<div style={{padding: '50px', textAlign: 'center', color: '#fff'}}>Loading plans…</div>}>
      <Subscriptions />
    </Suspense>
  );
}
import React from 'react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import FirebaseAuth from '../components/FirebaseAuth';
import Layout from '../components/Layout/Layout';

const FirebaseAuthPage = () => {
  return (
    <div>
      <Head>
        <title>Firebase Authentication | MDTS Tech</title>
        <meta name="description" content="Sign in or create an account using Firebase Authentication" />
      </Head>

      <Layout title="Firebase Authentication | MDTS Tech" description="Sign in or create an account using Firebase Authentication">

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Firebase Authentication</h1>
          <FirebaseAuth />
        </div>
      
</Layout>
    </div>
  );
};

export default FirebaseAuthPage;

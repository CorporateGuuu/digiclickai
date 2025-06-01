import React from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { MarketplaceIntegration, FourSellerIntegration } from '../../components/Marketplace';

const AdminMarketplace = () => {
  return (
    <>
      <Head>
        <title>Marketplace Integration | MDTS Admin</title>
        <meta name="description" content="Manage your marketplace integrations with eBay, Amazon, and TikTok Shop" />
      </Head>

      <AdminLayout>
        <MarketplaceIntegration />
        <FourSellerIntegration />
      </AdminLayout>
    </>
  );
};

export default AdminMarketplace;

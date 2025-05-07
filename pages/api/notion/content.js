import { getContentPages, getContentPage } from '../../../lib/notion';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { id, type } = req.query;

  // Get a single content page by ID
  if (id) {
    const { data, error } = await getContentPage(id);

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Transform Notion data to a more usable format
    const page = data.page;
    const content = data.content;

    const formattedContent = {
      id: page.id,
      title: page.properties.Title?.title?.[0]?.plain_text || '',
      slug: page.properties.Slug?.rich_text?.[0]?.plain_text || '',
      type: page.properties.Type?.select?.name || '',
      publishDate: page.properties['Publish Date']?.date?.start || '',
      author: page.properties.Author?.rich_text?.[0]?.plain_text || '',
      excerpt: page.properties.Excerpt?.rich_text?.[0]?.plain_text || '',
      featuredImage: page.properties['Featured Image']?.url || '',
      blocks: content
    };

    return res.status(200).json({ success: true, content: formattedContent });
  }

  // Get content pages, optionally filtered by type
  let filter = {};
  if (type) {
    filter = {
      property: 'Type',
      select: {
        equals: type
      }
    };
  }

  // Sort by publish date descending
  const sorts = [
    {
      property: 'Publish Date',
      direction: 'descending'
    }
  ];

  const { data, error } = await getContentPages(filter, sorts);

  if (error) {
    return res.status(500).json({ success: false, message: error });
  }

  // Transform Notion data to a more usable format
  const pages = data ? data.map(page => {
    const properties = page.properties;
    return {
      id: page.id,
      title: properties.Title?.title?.[0]?.plain_text || '',
      slug: properties.Slug?.rich_text?.[0]?.plain_text || '',
      type: properties.Type?.select?.name || '',
      publishDate: properties['Publish Date']?.date?.start || '',
      author: properties.Author?.rich_text?.[0]?.plain_text || '',
      excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || '',
      featuredImage: properties['Featured Image']?.url || ''
    };
  }) : [];

  return res.status(200).json({ success: true, pages });
}

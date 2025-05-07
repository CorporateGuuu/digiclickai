<?php
/**
 * MobileSentrix PHP Scraper
 * 
 * A simple PHP scraper for MobileSentrix website that can be run on any web server.
 */

// Configuration
$target_url = 'https://www.mobilesentrix.com/';
$output_dir = 'output';

// Create output directory if it doesn't exist
if (!file_exists($output_dir)) {
    mkdir($output_dir, 0777, true);
}

// Function to fetch URL content
function fetch_url($url) {
    echo "Fetching $url...\n";
    
    $options = [
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.5'
            ],
            'timeout' => 30,
            'ignore_errors' => true
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ];
    
    $context = stream_context_create($options);
    $html = @file_get_contents($url, false, $context);
    
    if ($html === false) {
        echo "Error fetching $url\n";
        return null;
    }
    
    echo "Successfully fetched $url\n";
    return $html;
}

// Function to extract title
function extract_title($html) {
    if (preg_match('/<title>(.*?)<\/title>/i', $html, $matches)) {
        return $matches[1];
    }
    return 'Unknown Title';
}

// Function to extract description
function extract_description($html) {
    if (preg_match('/<meta\s+name=["|\']description["|\'].+?content=["|\']([^"|\'>]*)["|\'].*?>/i', $html, $matches) ||
        preg_match('/<meta\s+content=["|\']([^"|\'>]*)["|\'].*?name=["|\']description["|\'].*?>/i', $html, $matches)) {
        return $matches[1];
    }
    return 'No description available';
}

// Function to extract categories
function extract_categories($html, $base_url) {
    $categories = [];
    
    if (preg_match_all('/<a\s+href=["|\']([^"|\']*category[^"|\']*)["|\']\s*[^>]*>(.*?)<\/a>/i', $html, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $url = $match[1];
            $name = strip_tags($match[2]);
            $name = trim($name);
            
            if ($name && strlen($name) < 50) {
                // Make URL absolute
                if (!preg_match('/^https?:\/\//i', $url)) {
                    $base_url = rtrim($base_url, '/');
                    $url = $base_url . (substr($url, 0, 1) === '/' ? '' : '/') . ltrim($url, '/');
                }
                
                $categories[] = [
                    'name' => $name,
                    'url' => $url
                ];
            }
        }
    }
    
    // Remove duplicates
    $unique_categories = [];
    $seen_urls = [];
    
    foreach ($categories as $category) {
        if (!in_array($category['url'], $seen_urls)) {
            $unique_categories[] = $category;
            $seen_urls[] = $category['url'];
        }
    }
    
    return $unique_categories;
}

// Function to extract products
function extract_products($html, $base_url) {
    $products = [];
    
    // Try different patterns for product blocks
    $product_patterns = [
        '/<div\s+class=["|\'](?:product|item)[^"|\']*["|\'][^>]*>(.*?)<\/div>\s*(?:<\/div>|<div)/is',
        '/<li[^>]*class=["|\'][^"|\']*product[^"|\']*["|\'][^>]*>(.*?)<\/li>/is',
        '/<article[^>]*>(.*?)<\/article>/is'
    ];
    
    $product_blocks = [];
    
    foreach ($product_patterns as $pattern) {
        if (preg_match_all($pattern, $html, $matches)) {
            $product_blocks = $matches[0];
            echo "Found " . count($product_blocks) . " product blocks with pattern " . array_search($pattern, $product_patterns) . "\n";
            break;
        }
    }
    
    // Process up to 30 product blocks
    for ($i = 0; $i < min(count($product_blocks), 30); $i++) {
        $block = $product_blocks[$i];
        
        try {
            // Extract product URL and name
            if (preg_match('/<a\s+href=["|\']([^"|\']+)["|\']\s*[^>]*>(?:.*?<img[^>]*alt=["|\']([^"|\']+)["|\']\s*|.*?<span[^>]*>([^<]+)<\/span>)/is', $block, $url_match)) {
                $product_url = $url_match[1];
                $product_name = isset($url_match[2]) ? $url_match[2] : (isset($url_match[3]) ? $url_match[3] : 'Unknown Product');
                
                // Clean up name
                $product_name = strip_tags($product_name);
                $product_name = trim($product_name);
                
                // Skip if name is too short or looks like navigation
                if (strlen($product_name) < 5 || in_array(strtolower($product_name), ['home', 'next', 'previous', 'category'])) {
                    continue;
                }
                
                // Extract image URL
                $image_url = '';
                if (preg_match('/<img[^>]*src=["|\']([^"|\']+)["|\']/i', $block, $img_match)) {
                    $image_url = $img_match[1];
                }
                
                // Extract price
                $price = 'N/A';
                if (preg_match('/<span[^>]*class=["|\'][^"|\']*(?:price|amount)[^"|\']*["|\'][^>]*>(.*?)<\/span>/is', $block, $price_match)) {
                    $price = $price_match[1];
                    $price = strip_tags($price);
                    $price = trim($price);
                    
                    if (preg_match('/[$€£]?\s*(\d[\d,.]*)/i', $price, $price_clean)) {
                        $price = $price_clean[1];
                    }
                }
                
                // Make URLs absolute
                if (!preg_match('/^https?:\/\//i', $product_url)) {
                    $base_url = rtrim($base_url, '/');
                    $product_url = $base_url . (substr($product_url, 0, 1) === '/' ? '' : '/') . ltrim($product_url, '/');
                }
                
                if ($image_url && !preg_match('/^https?:\/\//i', $image_url)) {
                    $base_url = rtrim($base_url, '/');
                    $image_url = $base_url . (substr($image_url, 0, 1) === '/' ? '' : '/') . ltrim($image_url, '/');
                }
                
                // Add to products list
                $products[] = [
                    'name' => $product_name,
                    'url' => $product_url,
                    'image' => $image_url,
                    'price' => $price
                ];
            }
        } catch (Exception $e) {
            echo "Error parsing product block: " . $e->getMessage() . "\n";
        }
    }
    
    // Remove duplicates
    $unique_products = [];
    $seen_urls = [];
    
    foreach ($products as $product) {
        if (!in_array($product['url'], $seen_urls)) {
            $unique_products[] = $product;
            $seen_urls[] = $product['url'];
        }
    }
    
    return $unique_products;
}

// Function to extract images
function extract_images($html, $base_url) {
    $images = [];
    $seen_urls = [];
    
    if (preg_match_all('/src=["|\']([^"|\'>\s]*\.(?:jpg|jpeg|png|gif|webp))["|\']/', $html, $matches)) {
        foreach ($matches[1] as $img_url) {
            // Make URL absolute
            if (!preg_match('/^https?:\/\//i', $img_url)) {
                $base_url = rtrim($base_url, '/');
                $img_url = $base_url . (substr($img_url, 0, 1) === '/' ? '' : '/') . ltrim($img_url, '/');
            }
            
            if (!in_array($img_url, $seen_urls)) {
                $images[] = $img_url;
                $seen_urls[] = $img_url;
            }
        }
    }
    
    return $images;
}

// Function to generate HTML report
function generate_html_report($data) {
    $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MobileSentrix Scraper Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1, h2 { color: #2c3e50; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .stats { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .product-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; transition: transform 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .product-image { width: 100%; height: 200px; object-fit: contain; border-radius: 3px; }
        .product-title { font-weight: bold; margin: 10px 0 5px; font-size: 1.1em; }
        .product-price { color: #e63946; font-weight: bold; }
        .category-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
        .category-list li { margin-bottom: 5px; background: #eee; padding: 5px 10px; border-radius: 15px; }
        .category-list li a { text-decoration: none; color: #333; }
        .category-list li a:hover { text-decoration: underline; }
        .timestamp { color: #666; font-size: 0.9em; margin-top: 30px; text-align: center; }
        .btn { display: inline-block; padding: 8px 15px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
        .btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>MobileSentrix Scraper Report</h1>
        
        <div class="stats">
            <p><strong>Website:</strong> {$data['title']}</p>
            <p><strong>Description:</strong> {$data['description']}</p>
            <p><strong>Scrape Date:</strong> {$data['scrape_date']}</p>
            <p><strong>Categories Found:</strong> {$data['category_count']}</p>
            <p><strong>Products Found:</strong> {$data['product_count']}</p>
            <p><strong>Images Found:</strong> {$data['image_count']}</p>
        </div>
        
        <h2>Categories</h2>
        <ul class="category-list">
HTML;

    // Add categories
    $categories = array_slice($data['categories'], 0, 20);
    foreach ($categories as $category) {
        $html .= "<li><a href=\"{$category['url']}\" target=\"_blank\">{$category['name']}</a></li>\n";
    }

    $html .= <<<HTML
        </ul>
        
        <h2>Products</h2>
        <div class="product-grid">
HTML;

    // Add products
    foreach ($data['products'] as $product) {
        $html .= <<<HTML
            <div class="product-card">
                <img src="{$product['image']}" alt="{$product['name']}" class="product-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687a4b89fe%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687a4b89fe%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.4296875%22%20y%3D%22104.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';">
                <div class="product-title">{$product['name']}</div>
                <div class="product-price">{$product['price']}</div>
                <a href="{$product['url']}" class="btn" target="_blank">View Product</a>
            </div>
HTML;
    }

    $html .= <<<HTML
        </div>
        
        <div class="timestamp">
            Report generated on {$data['scrape_date']}
        </div>
    </div>
</body>
</html>
HTML;

    return $html;
}

// Main function
function main($target_url, $output_dir) {
    echo "=============================================================\n";
    echo "MOBILESENTRIX SCRAPER (PHP VERSION)\n";
    echo "=============================================================\n";
    echo "Target URL: $target_url\n";
    echo "Started at: " . date('Y-m-d H:i:s') . "\n";
    echo "-------------------------------------------------------------\n";
    
    // Fetch website content
    $html = fetch_url($target_url);
    
    if (!$html) {
        echo "Failed to fetch website content. Exiting.\n";
        return;
    }
    
    echo "\nExtracting data...\n";
    
    // Extract basic information
    $title = extract_title($html);
    $description = extract_description($html);
    
    // Extract categories, products, and images
    $categories = extract_categories($html, $target_url);
    $products = extract_products($html, $target_url);
    $images = extract_images($html, $target_url);
    
    // Limit images to first 100
    $images = array_slice($images, 0, 100);
    
    // Prepare data structure
    $data = [
        'url' => $target_url,
        'title' => $title,
        'description' => $description,
        'scrape_date' => date('Y-m-d H:i:s'),
        'categories' => $categories,
        'category_count' => count($categories),
        'products' => $products,
        'product_count' => count($products),
        'images' => $images,
        'image_count' => count($images)
    ];
    
    // Print summary
    echo "\n=============================================================\n";
    echo "SCRAPING RESULTS\n";
    echo "=============================================================\n";
    echo "Website Title: $title\n";
    echo "Categories Found: " . count($categories) . "\n";
    echo "Products Found: " . count($products) . "\n";
    echo "Images Found: " . count($images) . "\n";
    
    // Save data to files
    echo "\nSaving data files...\n";
    
    // Save as JSON
    $json_path = "$output_dir/mobilesentrix_data.json";
    file_put_contents($json_path, json_encode($data, JSON_PRETTY_PRINT));
    echo "Saved JSON data to $json_path\n";
    
    // Save image URLs to a text file
    $img_path = "$output_dir/mobilesentrix_images.txt";
    file_put_contents($img_path, implode("\n", $images));
    echo "Saved image URLs to $img_path\n";
    
    // Save HTML report
    $html_report = generate_html_report($data);
    $report_path = "$output_dir/mobilesentrix_report.html";
    file_put_contents($report_path, $html_report);
    echo "Saved HTML report to $report_path\n";
    
    // Save categories to a text file
    $cat_path = "$output_dir/mobilesentrix_categories.txt";
    $cat_content = '';
    foreach ($categories as $cat) {
        $cat_content .= "{$cat['name']}: {$cat['url']}\n";
    }
    file_put_contents($cat_path, $cat_content);
    echo "Saved categories to $cat_path\n";
    
    // Save products to a CSV-like text file
    $prod_path = "$output_dir/mobilesentrix_products.txt";
    $prod_content = "Name\tPrice\tURL\tImage URL\n";
    foreach ($products as $product) {
        $prod_content .= "{$product['name']}\t{$product['price']}\t{$product['url']}\t{$product['image']}\n";
    }
    file_put_contents($prod_path, $prod_content);
    echo "Saved products to $prod_path\n";
    
    echo "\n=============================================================\n";
    echo "SCRAPING COMPLETED SUCCESSFULLY\n";
    echo "=============================================================\n";
    echo "Finished at: " . date('Y-m-d H:i:s') . "\n";
    echo "Output directory: " . realpath($output_dir) . "\n";
    echo "\nTo view the report, open:\n";
    echo realpath("$output_dir/mobilesentrix_report.html") . "\n";
}

// Run the main function
main($target_url, $output_dir);
?>

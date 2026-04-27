#!/usr/bin/env python3
"""
Krya 博客搜索索引生成器
生成前端兼容的 BM25 索引格式
"""

import json
import os
import re
from pathlib import Path
from collections import Counter
import math

# 配置
CONTENT_DIR = Path(__file__).parent / "src" / "content" / "posts"
OUTPUT_FILE = Path(__file__).parent / "public" / "search-index.json"

def extract_frontmatter(content: str) -> dict:
    """提取 Markdown frontmatter"""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if not match:
        return {}
    
    frontmatter = {}
    for line in match.group(1).strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            frontmatter[key.strip()] = value.strip().strip('"\'')
    return frontmatter

def tokenize(text: str) -> list:
    """中文分词：使用 2-3 字 n-gram（与前端一致）"""
    # 移除 HTML 标签
    text = re.sub(r'<[^>]+>', '', text)
    # 移除特殊字符，保留中文、英文、数字
    text = re.sub(r'[^\w\s\u4e00-\u9fff]', ' ', text)
    
    tokens = []
    
    # 英文单词
    words = re.findall(r'[a-zA-Z]+', text)
    tokens.extend([w.lower() for w in words])
    
    # 中文 2-3 字 n-gram
    chinese_text = re.sub(r'[a-zA-Z0-9\s]', '', text)
    for i in range(len(chinese_text) - 1):
        char = chinese_text[i]
        if '\u4e00' <= char <= '\u9fff':
            # 2-gram
            tokens.append(chinese_text[i:i+2])
            # 3-gram
            if i < len(chinese_text) - 2:
                tokens.append(chinese_text[i:i+3])
    
    return tokens

def calculate_bm25_index(documents: list, k1: float = 1.5, b: float = 0.75) -> dict:
    """
    计算 BM25 索引，返回前端兼容的格式
    """
    # 文档长度
    doc_lengths = [len(doc['tokens']) for doc in documents]
    avg_doc_length = sum(doc_lengths) / len(documents) if documents else 0
    
    # 词频统计
    doc_freq = Counter()  # 包含该词的文档数
    term_freq = [Counter(doc['tokens']) for doc in documents]  # 每个文档的词频
    
    for tf in term_freq:
        for term in tf:
            doc_freq[term] += 1
    
    # 计算 IDF
    n_docs = len(documents)
    idf = {}
    for term, df in doc_freq.items():
        idf[term] = round(math.log((n_docs - df + 0.5) / (df + 0.5) + 1), 4)
    
    # 构建文档索引（前端需要的格式）
    docs_index = {}
    for doc_id, tf in enumerate(term_freq):
        docs_index[str(doc_id)] = dict(tf)
    
    return {
        'documents': docs_index,
        'doc_lengths': {str(i): length for i, length in enumerate(doc_lengths)},
        'avg_doc_length': round(avg_doc_length, 4),
        'idf': idf,
    }

def main():
    print("🔍 Krya 博客搜索索引生成器")
    print("=" * 40)
    
    # 收集所有文章
    articles = []
    for md_file in sorted(CONTENT_DIR.glob("*.md")):
        content = md_file.read_text(encoding='utf-8')
        frontmatter = extract_frontmatter(content)
        
        if frontmatter.get('draft') == 'true':
            continue
        
        # 提取正文（移除 frontmatter）
        body = re.sub(r'^---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)
        tokens = tokenize(body)
        
        # 处理 categories 和 tags
        categories_raw = frontmatter.get('categories', '[]')
        tags_raw = frontmatter.get('tags', '[]')
        
        # 解析 YAML 数组格式
        if categories_raw.startswith('['):
            try:
                categories = json.loads(categories_raw)
            except:
                categories = [c.strip() for c in categories_raw.strip('[]').split(',') if c.strip()]
        else:
            categories = [c.strip() for c in categories_raw.split(',') if c.strip()]
        
        if tags_raw.startswith('['):
            try:
                tags = json.loads(tags_raw)
            except:
                tags = [t.strip() for t in tags_raw.strip('[]').split(',') if t.strip()]
        else:
            tags = [t.strip() for t in tags_raw.split(',') if t.strip()]
        
        # 生成摘要（取正文前 200 字符，移除 Markdown 图片）
        body_text = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', body)  # 移除 Markdown 图片
        body_text = re.sub(r'\s+', ' ', body_text).strip()
        excerpt = body_text[:200] + '...' if len(body_text) > 200 else body_text
        
        articles.append({
            'id': md_file.stem,
            'title': frontmatter.get('title', md_file.stem),
            'date': frontmatter.get('date', ''),
            'categories': categories,
            'tags': tags,
            'excerpt': excerpt,
            'tokens': tokens,
        })
        
        print(f"  ✓ {frontmatter.get('title', md_file.stem)[:30]}")
    
    print(f"\n📊 共 {len(articles)} 篇文章")
    
    # 计算 BM25 索引
    print("\n⚙️  计算 BM25 索引...")
    bm25_index = calculate_bm25_index(articles)
    
    # 构建输出格式（前端兼容）
    # 前端期望: { documents: [{ slug, title, date, excerpt, content, wordCount }, ...] }
    documents = []
    for art in articles:
        # Read the full markdown content for searching
        md_file = next((f for f in CONTENT_DIR.glob("*.md") if f.stem == art['id']), None)
        content_text = ""
        if md_file:
            raw = md_file.read_text(encoding='utf-8')
            content_text = re.sub(r'^---\s*\n.*?\n---\s*\n', '', raw, flags=re.DOTALL)
            
        # Clean content for display in JSON (remove images to keep size small, keep text)
        clean_content = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', content_text)
        
        documents.append({
            'slug': art['id'],
            'title': art['title'],
            'date': art['date'],
            'excerpt': art['excerpt'],
            'content': clean_content,
            'wordCount': len(art['tokens']) # Approximate word count
        })
        
    output = {
        'posts': documents,
        'index': bm25_index,
    }
    
    # 保存 JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 索引已保存到：{OUTPUT_FILE}")
    print(f"📦 文件大小：{OUTPUT_FILE.stat().st_size / 1024:.1f} KB")
    print(f"📈 索引词数：{len(bm25_index['idf'])}")

if __name__ == "__main__":
    main()

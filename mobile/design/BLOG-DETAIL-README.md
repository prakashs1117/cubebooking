# Blog Detail Modal Component

A responsive blog detail page that opens as a modal overlay when clicking blog posts in the Employee Connect feed.

## Features

✅ **Mobile (390×844)**
- Full-screen modal with slide-up animation
- Sticky engagement bar with scroll fade effect
- Like, comment, share, bookmark actions
- Comment input and chronological comments list
- Author card with Follow button
- Smooth swipe-down gesture to close

✅ **Tablet/iPad (880×660)**
- Centered modal with 60/40 split layout
- Article content on left (scrollable)
- Sticky sidebar on right (never scrolls):
  - Vertical engagement bar (always visible)
  - Author card with bio
  - Related posts for discovery
- Related post transitions

✅ **General**
- Dark mode support via CSS custom properties
- Keyboard accessibility (Escape to close, Tab navigation)
- Native share API with fallback to clipboard
- Responsive text sizing for small screens
- Focus trap for modal
- WCAG AA color contrast compliant

## File Structure

```
blog-detail.html          — Main modal component (HTML + CSS + JS)
blog-detail-DEMO.html     — Standalone demo page
BLOG-DETAIL-README.md     — This file
```

## Usage

### Standalone Demo
1. Open `blog-detail.html` in a browser to see the modal in action
2. Click engagement buttons to test interactions
3. Type a comment and press Enter or click Post
4. Resize to tablet width (880px+) to see split layout

### Integration

#### 1. Add to Your App
Copy the entire `<style>` section from `blog-detail.html` into your app's stylesheet.

Copy the `<script>` section into your app's JavaScript file.

Copy the SVG icons from the `<svg>` sprite (or merge with existing sprite).

#### 2. Attach Click Handlers
```html
<!-- In your feed post cards -->
<div class="post-card" onclick="openBlogModal()">
  <h3>Blog Title</h3>
  <p>Blog excerpt...</p>
</div>
```

#### 3. Wire Up APIs
Replace mock data in the modal:

```javascript
async function loadArticle(articleId) {
  const article = await fetch(`/api/articles/${articleId}`).then(r => r.json());

  // Update DOM elements
  document.getElementById('articleTitle').textContent = article.title;
  document.getElementById('articleBody').innerHTML = article.body;
  document.getElementById('likeCount').textContent = article.engagement.likes;
  // ... etc
}
```

#### 4. Connect Comment Endpoint
```javascript
async function submitComment() {
  const text = document.getElementById('commentInput').value.trim();

  const comment = await fetch(`/api/articles/${articleId}/comments`, {
    method: 'POST',
    body: JSON.stringify({text}),
    headers: {'Content-Type': 'application/json'}
  }).then(r => r.json());

  // Add to DOM
  addCommentToList(comment);
  document.getElementById('commentInput').value = '';
}
```

## Data Model

```typescript
interface BlogPost {
  id: string;
  title: string;
  body: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    followedByUser: boolean;
  };
  category: "blog" | "news" | "research";
  publishedAt: string;
  readingTime: number;
  heroGradient: string;
  engagement: {
    likes: number;
    likedByUser: boolean;
    commentCount: number;
    bookmarkedByUser: boolean;
  };
  comments: Comment[];
  relatedPosts?: BlogPost[]; // tablet sidebar only
}

interface Comment {
  id: string;
  author: {name: string; avatar: string};
  text: string;
  publishedAt: string;
  likes: number;
  likedByUser: boolean;
}
```

## Customization

### Colors
Update CSS custom properties in `:root` and `.dark`:
```css
--primary: #149B5F;        /* Main action color */
--accent: #ECFDF3;         /* Background accents */
--card: #FFFFFF;           /* Modal background */
```

### Hero Gradient
Assign gradient per post category:
```javascript
const heroGradients = {
  'blog': 'linear-gradient(135deg, #0B5A37, #149B5F)',
  'research': 'linear-gradient(135deg, #8E44AD, #6C3483)',
  'news': 'linear-gradient(135deg, #149B5F, #1FB1A4)'
};
```

### Font
Inherits from app's font family (default: Noto Sans)

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support (iOS 13+) |
| Edge | ✅ Full support |
| IE11 | ❌ Not supported (CSS custom properties) |

## Performance Notes

- Engagement bar fade uses scroll event listener (throttled)
- Comment submission is optimistic (instant UI update)
- Modal animations use CSS transforms (GPU-accelerated)
- No external dependencies (vanilla JS)
- Bundle size: ~50KB (HTML+CSS+JS combined)

## Accessibility

- `role="dialog"` and `aria-modal="true"` on modal
- Focus trap prevents tab from leaving modal
- Escape key closes modal
- All buttons have `aria-label` attributes
- Semantic HTML with proper heading hierarchy
- Color contrast meets WCAG AA standards
- Supports `prefers-color-scheme` for dark mode

## Testing Checklist

- [ ] Modal opens with animation
- [ ] Modal closes with swipe (mobile) or X button
- [ ] Engagement bar fades on scroll (mobile only)
- [ ] Like/bookmark toggle works
- [ ] Comment input shows Post button when text present
- [ ] Comment submission clears input
- [ ] Related posts transition smoothly (tablet)
- [ ] Dark mode toggle works
- [ ] Keyboard Escape closes modal
- [ ] Tab navigation stays within modal
- [ ] On tablet (880px+), sidebar is visible
- [ ] On mobile (<768px), sidebar is hidden

## Future Enhancements

- [ ] Threaded comment replies
- [ ] Comment reactions (emoji picker)
- [ ] Edit/delete own comments
- [ ] Comment mentions (@author)
- [ ] Article translation
- [ ] Social share preview cards
- [ ] Related posts AI recommendations
- [ ] Article bookmarks collection
- [ ] Author follow notifications

## Questions?

Refer to the design spec at: `docs/superpowers/specs/2026-06-11-blog-detail-page-design.md`

# SERP Search Enhancement TODO

## Completed ✅

- [x] Add OpenRouter as fallback AI provider in API Config
- [x] Remove standalone "AI Overview" nav item (roll into SERP Search)
- [x] Add all SerpWow search types (web, images, news, videos, places, shopping)
- [x] Add advanced parameter controls (engine, domain, language, country, time, safe)
- [x] Add collapsible "Advanced Options" panel
- [x] Add documentation quick links

## TODO 📋

### 1. Add Batch Capability

- [ ] Create batch input UI (textarea for multiple queries)
- [ ] Batch status tracking
- [ ] Results aggregation view
- [ ] Export batch results (CSV, JSON)
- [ ] Link to SerpWow Batches API docs

### 3. Integrate AI Overview into SERP Search

- [ ] Display AI Overview prominently when present in results
- [ ] Add "AI Summary" toggle option
- [ ] Style the AI Overview section distinctively

### 4. Add AI Chat Assistant for Troubleshooting

- [ ] Create chat UI component
- [ ] Implement memory/context persistence (localStorage)
- [ ] Connect to Gemini or OpenRouter
- [ ] Pre-load with SerpWow documentation context
- [ ] Add "Research" capability for unknown issues
- [ ] Learning/knowledge base accumulation

### 5. Documentation Links

- [ ] Add prominent links to SerpWow docs
- [ ] Quick reference for parameters
- [ ] Example queries section

## Notes

- SerpWow supports: Google, Bing, Yahoo, Baidu, Yandex, Naver, Amazon, eBay
- Batches API allows up to 15,000 searches per batch
- AI assistant should use OpenRouter as fallback when Gemini unavailable

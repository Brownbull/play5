# Intelligent Bucket List App - Development Plan

**Auto-Classification System with Proactive Surfacing**

## Project Overview

An adaptive external brain that transforms messy notes into structured, actionable items with intelligent classification and activity-based surfacing.

### Core Features
- **Smart Note Parsing**: Extract multiple items from single notes
- **Flexible Tagging**: Up to 3 auto-suggested tags per item
- **Activity-Based Dashboard**: Manual activity selection with relevant item surfacing
- **Learning System**: "Show less like this" feedback for relevance improvement
- **Google Keep Integration**: Import and sync existing notes
- **Recipe Suggestions**: AI-generated or web-sourced recipes

---

## <× **Phase 1: Foundation**

- [ ] **Task 1: Set up Wasp project with authentication and basic UI structure**
  - [ ] Initialize new Wasp project
  - [ ] Configure authentication (username/password for MVP)
  - [ ] Set up basic page routing and navigation
  - [ ] Add TailwindCSS for styling

- [ ] **Task 2: Design and implement database schema for Items, Tags, Activities**
  - [ ] Create Prisma models (Item, Tag, Activity, User)
  - [ ] Set up many-to-many relationships for Item-Tag mapping
  - [ ] Run database migrations
  - [ ] Add seed data for initial activities

- [ ] **Task 3: Create Wasp operations for core CRUD functionality**
  - [ ] Define queries: getItems, getItemsByActivity, getTags
  - [ ] Define actions: createItem, updateItem, deleteItem, createTag
  - [ ] Implement basic server-side logic
  - [ ] Add authentication checks to operations

---

## > **Phase 2: AI Integration**

- [ ] **Task 4: Set up Hugging Face API integration for AI/ML models**
  - [ ] Install @huggingface/inference package
  - [ ] Configure API keys and environment variables
  - [ ] Create AI service module for model calls
  - [ ] Test basic model connectivity

- [ ] **Task 5: Implement note parsing pipeline with NER and classification**
  - [ ] Build named entity recognition pipeline
  - [ ] Implement intent classification logic
  - [ ] Create item extraction from notes functionality
  - [ ] Add error handling for AI service calls

- [ ] **Task 6: Build tag suggestion engine (3 tags max per item)**
  - [ ] Implement tag generation based on item content
  - [ ] Create tag scoring and selection logic
  - [ ] Add predefined tag categories system
  - [ ] Ensure maximum 3 tags per item constraint

---

## =» **Phase 3: Core UI**

- [ ] **Task 7: Create activity-based dashboard with filtering**
  - [ ] Build activity selector component
  - [ ] Implement item filtering by activity
  - [ ] Add activity-specific item displays
  - [ ] Create responsive dashboard layout

- [ ] **Task 8: Implement manual note input interface**
  - [ ] Build note input form with rich text support
  - [ ] Add real-time parsing preview
  - [ ] Implement item extraction display
  - [ ] Add manual tag editing capability

- [ ] **Task 9: Add item display and management UI components**
  - [ ] Create item cards with tag display
  - [ ] Add item editing and deletion functionality
  - [ ] Implement item status management
  - [ ] Build item search and sorting features

---

## >à **Phase 4: Intelligence Features**

- [ ] **Task 10: Implement 'show less like this' learning feedback system**
  - [ ] Add relevance scoring to items
  - [ ] Create feedback collection UI (thumbs down)
  - [ ] Implement learning algorithm for tag relevance
  - [ ] Store user preferences and patterns

- [ ] **Task 11: Create recipe suggestion functionality (Google search/AI)**
  - [ ] Integrate Google Custom Search for recipes
  - [ ] Build recipe suggestion UI components
  - [ ] Add recipe saving to existing items
  - [ ] Implement fallback AI recipe generation

---

## = **Phase 5: Google Integration**

- [ ] **Task 12: Set up Google Keep API integration**
  - [ ] Configure Google API credentials
  - [ ] Implement OAuth2 flow for Google Keep access
  - [ ] Create Google Keep service module
  - [ ] Add API error handling and rate limiting

- [ ] **Task 13: Implement automatic note sync from Google Keep**
  - [ ] Build Google Keep note fetching functionality
  - [ ] Implement incremental sync mechanism
  - [ ] Add conflict resolution for duplicate items
  - [ ] Create sync status tracking

- [ ] **Task 14: Add bulk import functionality for existing notes**
  - [ ] Build bulk import UI for Google Keep notes
  - [ ] Implement batch processing for large note sets
  - [ ] Add import progress tracking
  - [ ] Create import history and rollback features

---

## ¡ **Phase 6: Polish & Deploy**

- [ ] **Task 15: Implement real-time updates and notifications**
  - [ ] Add WebSocket support for real-time item updates
  - [ ] Implement push notifications for relevant items
  - [ ] Create activity-based notification preferences
  - [ ] Add offline capability and sync

- [ ] **Task 16: Add testing suite for AI parsing and classification**
  - [ ] Write unit tests for AI parsing functions
  - [ ] Create integration tests for note processing
  - [ ] Add end-to-end tests for user workflows
  - [ ] Implement performance benchmarks

- [ ] **Task 17: Optimize performance and handle edge cases**
  - [ ] Implement caching for AI model responses
  - [ ] Add database query optimization
  - [ ] Handle malformed notes and parsing failures
  - [ ] Add rate limiting and abuse protection

- [ ] **Task 18: Deploy MVP and gather user feedback**
  - [ ] Configure production deployment (Fly.io)
  - [ ] Set up monitoring and analytics
  - [ ] Create user feedback collection system
  - [ ] Plan iteration based on user data

---

## <¯ **Priority Levels**

**Critical MVP (Tasks 1-9)**: Core functionality that makes the app usable  
**Enhanced MVP (Tasks 10-11)**: Intelligence features that provide main value  
**Full Product (Tasks 12-15)**: Google integration and advanced features  
**Production Ready (Tasks 16-18)**: Polish, testing, and deployment

---

## =' **Technical Stack**

- **Framework**: Wasp (React + Node.js + Prisma)
- **AI/ML**: Hugging Face models (NER, Classification, Text Generation)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Integration**: Google Keep API, Google Custom Search
- **Deployment**: Fly.io
- **Styling**: TailwindCSS

---

## =Ê **Key Metrics to Track**

- Note parsing accuracy
- Tag relevance scores
- User engagement with surfaced items
- Google Keep sync success rate
- User retention and feedback satisfaction

---

## =¡ **Example Data Flow**

**Input Note**: "Try that Italian place downtown, Giovanni recommended it. Also buy tomatoes for pasta sauce recipe"

**Parsed Output**:
1. **Item**: "Italian place downtown (Giovanni rec)"  
   **Tags**: [bucket-list, to-visit, restaurants]  
   **Activity**: Weekend Planning

2. **Item**: "Buy tomatoes"  
   **Tags**: [groceries, to-buy, ingredients]  
   **Activity**: Grocery Shopping

3. **Item**: "Pasta sauce recipe"  
   **Tags**: [cooking, recipes, italian]  
   **Activity**: Meal Planning  
   **Suggestion**: Link to AI-generated pasta sauce recipe

---

*Generated through agile brainstorming session - Ready for implementation!*
# LeySam Anglers - Project Proposal

## 1. Project Title

**LeySam Anglers: A Community-Driven Fishing Spot Discovery and Catch Sharing Mobile Application**

---

## 2. Project Description

LeySam Anglers is a React Native mobile application for anglers in Leyte and Samar to discover fishing spots, share catch experiences, and interact with the community. The app provides an interactive map interface, fishing spot management with GPS coordinates, catch report posting with photo sharing, and social engagement features (likes, comments). It includes secure Firebase authentication, user profiles, and cloud-based data synchronization for real-time access to community-shared fishing information.

---

## 3. Scope of the Study

### In Scope:
- User registration and authentication via Firebase
- Interactive map displaying fishing spots centered on Leyte and Samar (11.25°N, 125.00°E)
- CRUD operations for fishing spots
- Catch report posting and management with photo uploads
- Social interaction features (likes, comments)
- User profile creation and management
- Location-based services using GPS integration
- Real-time data synchronization with Cloud Firestore
- React Native with Expo, TypeScript, Firebase services, React Navigation, and React Native Maps
- iOS and Android platform support
- Target users: Anglers aged 18+ in Leyte and Samar with basic smartphone literacy

### Out of Scope:
- Desktop or web-based versions
- Payment processing and in-app transactions
- Advanced analytics and business intelligence dashboards
- Multi-language support (English only)
- Artificial intelligence-based fish identification
- Real-time live streaming capabilities
- Offline-first architecture with full data synchronization
- Commercial fishing spot licensing or verification
- Third-party app integrations

---

## 4. Limitations of the Study

**Technical Limitations:**
- GPS accuracy depends on device capabilities and environmental factors
- Limited offline functionality; primary features require internet connectivity
- Image storage limited by Firebase Storage quotas and bandwidth constraints
- Map coverage restricted to Leyte and Samar regions initially
- Real-time data synchronization may experience network latency delays
- Large image files may impact app performance and storage consumption

**Geographic & Infrastructure Limitations:**
- Regional focus restricted to Leyte and Samar provinces initially
- Dependent on local mobile network coverage and internet availability
- Fishing conditions and spot accessibility vary by season

**User-Related Limitations:**
- Data accuracy relies on user-provided information with no automatic verification
- Community-driven content requires active monitoring to prevent misuse
- Users must have smartphones with GPS capability
- English-only interface may limit adoption in some communities
- Excludes users without smartphone access or internet connectivity

**Scope Limitations:**
- Initial release limited to core features; advanced analytics unavailable
- Architecture designed for regional use; massive scalability requires future iterations
- Limited customization options for individual user preferences
- Data privacy dependent on user compliance with policies

---

## 5. Technology Stack

**Frontend:** React Native with Expo, TypeScript, React Navigation, React Native Maps, React Context API, AsyncStorage, expo-location, and expo-image-picker. Supported on iOS 13+ and Android 9+ (API 28+).

**Backend:** Firebase Authentication for user management, Cloud Firestore for real-time database, and Firebase Storage for image/media storage. Infrastructure hosted on Google Cloud Platform (Asia-Southeast region, asia-southeast1).

**Development Tools:** VS Code IDE, Git version control, npm/yarn package management, TypeScript for type checking, and Expo CLI for development and building.

---

## 6. Project Timeline (Estimated)

| Phase | Duration | Key Activities |
|-------|----------|----------------|
| Planning & Setup | 2 weeks | Project setup, Firebase configuration, environment setup |
| Core Development | 6 weeks | Authentication, Map, Spot Management, Catch Reports |
| Frontend UI/UX | 3 weeks | Polish UI, improve user experience, accessibility |
| Testing & QA | 2 weeks | Bug fixing, performance testing, security testing |
| Deployment | 1 week | Build release versions, app store submissions |
| **Total** | **14 weeks** | - |

---

## 7. Success Criteria

### Functional Success:
- ✓ All core features implemented and tested
- ✓ 95%+ uptime for cloud services
- ✓ App response time < 2 seconds for most operations
- ✓ Zero critical bugs at launch

### User Adoption:
- ✓ 100+ registered users within first month
- ✓ 50%+ monthly active user rate
- ✓ Average 4+ star app store rating

### Technical Success:
- ✓ Code coverage > 80%
- ✓ TypeScript compilation with no errors
- ✓ Successful builds for iOS and Android
- ✓ Secure Firebase rules implemented

---

## 8. Risk Management

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Firebase quota limits | High | Low | Monitor usage, implement caching |
| GPS accuracy issues | Medium | Medium | Provide accuracy disclaimer, manual correction option |
| Poor internet connectivity | High | Medium | Implement offline capabilities where possible |
| Content moderation challenges | Medium | High | Community reporting, automated filtering |
| Scope creep | Medium | High | Strict change management, phased releases |
| Security vulnerabilities | Critical | Low | Security audits, proper Firebase rules |

---

## 9. Deliverables

### Phase 1 (Core):
- [ ] React Native project setup with TypeScript
- [ ] Firebase authentication system
- [ ] Interactive map with spot markers
- [ ] Fishing spot management functionality
- [ ] Catch report posting system

### Phase 2 (Enhanced):
- [ ] Social interaction features (likes, comments)
- [ ] User profile system
- [ ] Photo sharing optimization
- [ ] Push notifications (optional)

### Phase 3 (Polish):
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation

### Phase 4 (Launch):
- [ ] iOS and Android builds
- [ ] App Store and Google Play submissions
- [ ] User documentation
- [ ] Post-launch support plan

---

## 10. Conclusion

LeySam Anglers represents a valuable initiative to serve the angling community in Leyte and Samar by providing a modern, accessible platform for sharing fishing knowledge and experiences. With a well-defined scope, modern technology stack, and clear success criteria, this project is positioned for successful implementation and community adoption.

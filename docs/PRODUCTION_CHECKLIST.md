# Sentient Terminal - Production Deployment Checklist

**Use this checklist before each deployment stage**

---

## Pre-Deployment (Complete Before Stage 1)

### Code Quality

- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] ESLint passes with no errors (`pnpm lint`)
- [ ] Prettier formatting applied (`pnpm format`)
- [ ] No `console.log` statements in production code
- [ ] No `debugger` statements
- [ ] All TODO/FIXME comments reviewed
- [ ] Dead code removed
- [ ] Git commits are clean and descriptive

### Dependencies

- [ ] All dependencies up to date (security patches)
- [ ] No vulnerable packages (`pnpm audit`)
- [ ] Bundle size checked and within limits
- [ ] Unused dependencies removed
- [ ] Lock file committed (`pnpm-lock.yaml`)

### Testing

- [ ] Manual testing completed on Chrome
- [ ] Manual testing completed on Firefox
- [ ] Manual testing completed on Safari
- [ ] Manual testing completed on Edge
- [ ] Mobile testing on iOS Safari
- [ ] Mobile testing on Chrome Android
- [ ] All interactive features working
- [ ] WebGL fallback tested
- [ ] PDF export tested
- [ ] Drag-drop functionality verified
- [ ] Scroll performance smooth

### Performance

- [ ] Lighthouse Performance score >85
- [ ] Lighthouse Accessibility score >90
- [ ] Lighthouse Best Practices score >90
- [ ] Lighthouse SEO score >85
- [ ] Bundle size <300KB gzipped
- [ ] Initial page load <3s (3G)
- [ ] Time to Interactive <3.8s
- [ ] Cumulative Layout Shift <0.1
- [ ] First Contentful Paint <1.8s

### Accessibility

- [ ] Screen reader tested (NVDA/JAWS/VoiceOver)
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on all elements
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] ARIA labels present where needed
- [ ] Skip navigation link works
- [ ] Alt text on images (if any)
- [ ] Form labels properly associated

### SEO

- [ ] Meta titles set
- [ ] Meta descriptions set
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Canonical URLs set
- [ ] Sitemap updated
- [ ] robots.txt configured

### Security

- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] CORS headers set correctly
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] SQL injection prevented (if applicable)
- [ ] Rate limiting configured (if applicable)
- [ ] HTTPS enforced

### Documentation

- [ ] SENTIENT_TERMINAL.md complete
- [ ] DEPLOYMENT_SENTIENT_TERMINAL.md reviewed
- [ ] Code comments in complex sections
- [ ] README updated with new route
- [ ] Team notified of deployment
- [ ] Changelog updated

---

## Staging Deployment (Stage 1)

### Pre-Deploy

- [ ] All pre-deployment checks passed
- [ ] Feature branch merged to main
- [ ] CI/CD pipeline green
- [ ] Vercel preview URL generated

### Deploy to Staging

```bash
# Push to trigger Vercel preview
git push origin main

# Verify deployment
curl https://<preview-url>.vercel.app/terminal
```

### Verify Staging

- [ ] Visit `/terminal` route on staging
- [ ] All 4 sections load without errors
- [ ] Browser console clear of errors
- [ ] Network tab shows no 404s
- [ ] Assets loading from CDN
- [ ] HTTPS certificate valid
- [ ] Performance acceptable

### Team Review

- [ ] Design team approval
- [ ] Engineering team approval
- [ ] Product team approval
- [ ] Stakeholder sign-off

---

## 10% Rollout (Stage 2)

### Pre-Deploy

- [ ] Staging fully validated
- [ ] Rollout percentage set to 10%
- [ ] Analytics tracking verified
- [ ] Monitoring dashboards ready
- [ ] Team on standby

### Deploy

```bash
# Set environment variable
NEXT_PUBLIC_SENTIENT_ROLLOUT_PERCENTAGE=10

# Deploy to production
git push origin main
```

### Monitor (First 24 Hours)

- [ ] Check Sentry hourly for errors
- [ ] Monitor GA for traffic split
- [ ] Verify 10% of users see new version
- [ ] Performance metrics stable
- [ ] No increase in error rate
- [ ] Support tickets reviewed

### Day 2-7 Monitoring

- [ ] Daily error rate check
- [ ] User feedback collected
- [ ] Engagement metrics tracked
- [ ] Conversion funnel analyzed
- [ ] Performance trends reviewed

### Exit Criteria

- [ ] No critical bugs (P0/P1)
- [ ] Error rate <1%
- [ ] Performance stable or improved
- [ ] Positive user feedback
- [ ] Team consensus to proceed

---

## 25% Rollout (Stage 3)

### Pre-Deploy

- [ ] 10% rollout successful
- [ ] All issues from Stage 2 resolved
- [ ] Team approval to scale up
- [ ] Monitoring dashboards reviewed

### Deploy

```bash
# Increase percentage
NEXT_PUBLIC_SENTIENT_ROLLOUT_PERCENTAGE=25
```

### Monitor

- [ ] First hour: Check for immediate issues
- [ ] First day: Hourly monitoring
- [ ] Week 1: Daily monitoring
- [ ] Compare metrics to 10% rollout

### A/B Test Analysis

- [ ] Sentient Terminal vs Legacy comparison
- [ ] Time on site metrics
- [ ] Engagement rate
- [ ] Conversion rate
- [ ] Bounce rate

---

## 50% Rollout (Stage 4)

### Pre-Deploy

- [ ] 25% rollout successful
- [ ] Metrics better than legacy
- [ ] No blocking issues
- [ ] Team approval

### Deploy

```bash
NEXT_PUBLIC_SENTIENT_ROLLOUT_PERCENTAGE=50
```

### Final Validation

- [ ] Peak traffic handling
- [ ] Server response times
- [ ] CDN performance
- [ ] Edge cases tested
- [ ] User satisfaction high

---

## 100% Rollout (Stage 5)

### Pre-Launch

- [ ] 50% rollout successful
- [ ] All metrics positive
- [ ] Executive approval
- [ ] Marketing materials ready
- [ ] Support team briefed

### Launch Day Checklist

**Morning of Launch**:

- [ ] Team standup at 9am
- [ ] All monitoring dashboards open
- [ ] Sentry alerts configured
- [ ] Slack war room created
- [ ] Support team ready

**Launch (12pm ET)**:

```bash
# Set to 100%
NEXT_PUBLIC_SENTIENT_ROLLOUT_PERCENTAGE=100

# Deploy
git push origin main
```

- [ ] Deployment successful
- [ ] `/terminal` accessible
- [ ] No errors in first 5 minutes
- [ ] Traffic flowing normally

**First Hour**:

- [ ] Check errors every 15 minutes
- [ ] Monitor performance
- [ ] Review user feedback
- [ ] Support ticket volume

**First 24 Hours**:

- [ ] Hourly error checks
- [ ] Performance stable
- [ ] Conversion tracking
- [ ] User sentiment positive

### Post-Launch Communications

- [ ] Social media announcement
- [ ] Email to customers
- [ ] Blog post published
- [ ] Press release (if applicable)
- [ ] Internal celebration 🎉

---

## Rollback Procedures

### Emergency Rollback (Critical Bug)

**Immediate Actions**:

1. **Identify Issue**:
   - [ ] Check Sentry for error patterns
   - [ ] Review user reports
   - [ ] Assess severity (P0/P1)

2. **Decision to Rollback**:
   - [ ] Team consensus
   - [ ] Stakeholder notification

3. **Execute Rollback**:

```bash
# Option 1: Environment variable
NEXT_PUBLIC_DISABLE_SENTIENT_TERMINAL=true

# Option 2: Reduce percentage
NEXT_PUBLIC_SENTIENT_ROLLOUT_PERCENTAGE=0

# Option 3: Vercel UI rollback
# Go to Vercel → Deployments → Previous deployment → Promote
```

4. **Post-Rollback**:
   - [ ] Verify legacy site working
   - [ ] Assess issue root cause
   - [ ] Plan fix
   - [ ] Test fix in staging
   - [ ] Re-deploy when ready

### Partial Rollback

**Scenario**: Scale back from 50% to 25%

```bash
# Simply reduce percentage
NEXT_PUBLIC_SENTIENT_ROLLOUT_PERCENTAGE=25
```

---

## Monitoring Checklist

### Hourly (First 24 Hours)

- [ ] Sentry error count
- [ ] Active users count
- [ ] Performance metrics
- [ ] Support tickets

### Daily (First Week)

- [ ] Error trends
- [ ] Engagement metrics
- [ ] Conversion rates
- [ ] User feedback
- [ ] Performance trends

### Weekly (First Month)

- [ ] A/B test results
- [ ] User satisfaction (NPS)
- [ ] Business metrics
- [ ] Iteration planning

---

## Success Metrics

### Technical

- ✅ **Uptime**: >99.9%
- ✅ **Error Rate**: <1%
- ✅ **Performance**: Lighthouse >85
- ✅ **Load Time**: <3s (75th percentile)
- ✅ **Bundle Size**: <300KB gzipped

### Business

- 📈 **Time on Page**: +50%
- 📉 **Bounce Rate**: -20%
- 📈 **Engagement**: +40%
- 📈 **Conversions**: +30%
- ⭐ **User Rating**: >4.5/5

---

## Contact List

### On-Call Rotation

**Week 1**: [Name] - [Phone] - [Slack]
**Week 2**: [Name] - [Phone] - [Slack]
**Week 3**: [Name] - [Phone] - [Slack]
**Week 4**: [Name] - [Phone] - [Slack]

### Escalation Path

1. **Engineering Team** (Slack: #sentient-terminal)
2. **Tech Lead** [Name] - [Phone]
3. **CTO** [Name] - [Phone]
4. **CEO** [Name] - [Phone] (P0 only)

### External Contacts

- **Vercel Support**: support@vercel.com
- **Sentry Support**: support@sentry.io
- **DNS Provider**: [Contact info]

---

## Post-Launch Review

**Schedule**: 1 week after 100% launch

### Review Meeting Agenda

1. **What Went Well**:
   - Successes
   - Wins
   - Positive feedback

2. **What Could Be Improved**:
   - Issues encountered
   - Process gaps
   - Communication breakdowns

3. **Metrics Review**:
   - Technical metrics
   - Business metrics
   - User feedback

4. **Lessons Learned**:
   - Key takeaways
   - Best practices
   - Documentation updates

5. **Next Steps**:
   - Iteration planning
   - Bug fixes
   - Feature enhancements

---

**Last Updated**: 2026-01-13
**Version**: 1.0.0
**Owner**: Engineering Team

# ATS Scoring Algorithm Update

## Overview
Updated the ATS scoring system to use a research-backed model based on real ATS systems (RChilli) and recruiter behavior data from Jobscan studies.

## Previous Model (Out of 100)
- **Keyword Matching**: 40 points (40%)
- **Formatting**: 30 points (30%)
- **Structure**: 20 points (20%)
- **Impact/Action Verbs**: 10 points (10%)

## New Model (Out of 100)
Based on RChilli's documented weights and CS-specific optimization:

1. **Technical Skills & Tools**: 35 points (35%)
   - Highest weighted factor
   - Based on data showing 76.4% of recruiters filter by skills first
   - Checks for programming languages, frameworks, libraries, and domain tools
   - Must appear in both dedicated skills section AND in project/experience bullets

2. **Job Title & Role Match**: 15 points (15%)
   - Matches target job title from JD with resume
   - Checks header, summary, and recent role/project titles
   - Based on RChilli's 35% weight for JobProfile

3. **Experience & Project Relevance**: 15 points (15%)
   - Evaluates bullet points combining JD keywords with action verbs and outcomes
   - Uses semantic matching, not just exact keyword presence
   - Considers contextual similarity

4. **Education & Coursework**: 10 points (10%)
   - Degree and major matching
   - Relevant CS courses for early-career roles
   - Based on data showing 59.7% of recruiters filter by education

5. **Location & Authorization**: 10 points (10%)
   - City/state/country match
   - Work authorization clarity (OPT, CPT, sponsorship)
   - Often a knockout criteria in real ATS

6. **ATS-Readable Formatting**: 10 points (10%)
   - Standard section headings
   - No text in images, complex tables, or multi-column layouts
   - Pass/fail constraint rather than gradual scoring

7. **Industry/Domain Keywords**: 5 points (5%)
   - Industry-specific terminology
   - Domain-specific tools or methodologies

## Key Changes

### API Response Structure
**Before:**
```typescript
{
  overallScore: number
  keywordScore: number
  formattingScore: number
  structureScore: number
  impactScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
  formattingIssues: string[]
}
```

**After:**
```typescript
{
  overallScore: number
  technicalSkillsScore: number
  jobTitleScore: number
  experienceRelevanceScore: number
  educationScore: number
  industryKeywordsScore: number
  locationScore: number
  formattingScore: number
  matchedSkills: string[]        // NEW: Separate technical skills tracking
  missingSkills: string[]        // NEW: Critical missing skills
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
  formattingIssues: string[]
  breakdown: {                    // NEW: Detailed breakdown
    technicalSkills: number
    jobTitle: number
    experience: number
    education: number
    industry: number
    location: number
    formatting: number
  }
}
```

### Files Modified

1. **[app/api/ats-score/route.ts](app/api/ats-score/route.ts)**
   - Updated `ATSScoreResponse` type with new scoring components
   - Completely rewrote system prompt to reflect research-backed scoring model
   - Added detailed instructions based on RChilli weights and Jobscan recruiter data
   - Updated response calculation to use 7 new scoring components
   - Added breakdown object for detailed analysis

2. **[components/career-builder/ATSCheckerTab.tsx](components/career-builder/ATSCheckerTab.tsx)**
   - Updated `ATSScoreResult` type to match new API response
   - Redesigned score breakdown UI to show all 7 components
   - Added separate sections for technical skills (highest priority)
   - Added informational badges showing weights and priority
   - Added research attribution note explaining the model

## Research Sources

The new model is based on:

1. **RChilli Search & Match API** - Real commercial ATS used by Workday, Oracle, and SAP
   - Documented default weights for job matching
   - Source: [RChilli Docs - Custom Weightage/Scoring](https://docs.rchilli.com/kc/c_RChilli_search_match_Features_Custom_Weightage_Scoring)

2. **Jobscan Recruiter Surveys**
   - 76.4% of recruiters filter by skills
   - 59.7% filter by education
   - 55.3% filter by job title
   - Source: [Jobscan ATS Guide](https://www.jobscan.co/applicant-tracking-systems)

3. **Industry ATS Behavior**
   - Oracle Taleo, Workday, iCIMS, Greenhouse, Lever analysis
   - Knockout questions and hard filters
   - Semantic matching and embeddings

## Benefits of New Model

1. **More Accurate**: Based on real ATS systems used by major companies
2. **CS-Specific**: Optimized for computer science and technical roles
3. **Actionable**: Clearly separates technical skills (highest priority) from other factors
4. **Research-Backed**: Uses documented weights from commercial systems
5. **Transparent**: Shows exact breakdown of how score is calculated
6. **Educational**: Helps users understand what recruiters actually filter by

## Migration Notes

- The API endpoint path remains the same: `/api/ats-score`
- Request format unchanged (still accepts `jobDescription` and `resume`)
- Response structure is different - consuming applications need to update their types
- Old scores ranged 0-100, new scores also range 0-100 (compatible)
- Frontend component automatically updated to display new breakdown

## Testing Recommendations

1. Test with various CS job descriptions (SWE, ML Engineer, Data Scientist)
2. Verify technical skills are correctly extracted and weighted highest
3. Check that location and education scoring works correctly
4. Ensure formatting issues are still detected
5. Validate that suggestions are specific and actionable

## Future Enhancements

Potential improvements based on the research:

1. Add semantic similarity scoring using embeddings
2. Implement knockout question detection
3. Add years-of-experience range matching
4. Include certification and license tracking
5. Add company-specific customization options
6. Implement A/B testing to validate accuracy against real ATS results

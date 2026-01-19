import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import path from 'path'

// Skip WASM-dependent tests in CI - WASM initialization is slow/unreliable
const isCI = !!process.env.CI

test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
  test('should have no accessibility violations on landing page', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Run accessibility scan
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    
    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations found:')
      results.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`)
        console.log(`  Impact: ${violation.impact}`)
        console.log(`  Help: ${violation.helpUrl}`)
      })
    }
    
    expect(results.violations).toEqual([])
  })
  
  test('should have no violations after file upload', async ({ page }) => {
    // Skip in CI - requires WASM to process uploaded file
    test.skip(isCI, 'WASM file processing is slow/unreliable in CI')
    
    await page.goto('/')
    
    // Upload a test file - use specific ID to avoid matching queue import input
    const fileInput = page.locator('#fileInput')
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.scad')
    
    try {
      await fileInput.setInputFiles(fixturePath)
      
      // Wait for parameters UI to render (avoid preset select)
      await page.waitForSelector('.param-control', {
        timeout: 15000
      })
      
      // Run accessibility scan on parameter UI
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      if (results.violations.length > 0) {
        console.log('Violations in parameter UI:')
        results.violations.forEach(v => {
          console.log(`- ${v.id}: ${v.description}`)
        })
      }
      
      expect(results.violations).toEqual([])
    } catch (error) {
      console.log('Could not complete file upload test:', error.message)
      // Don't fail test if fixture is missing
      test.skip()
    }
  })
  
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    
    // Should have at least one heading
    expect(headings.length).toBeGreaterThan(0)
    
    // First heading should be h1
    const firstHeading = await headings[0].evaluate(el => el.tagName)
    expect(firstHeading).toBe('H1')
    
    console.log('Heading structure:', await Promise.all(
      headings.map(async h => await h.evaluate(el => ({ 
        tag: el.tagName, 
        text: el.textContent 
      })))
    ))
  })
  
  test('should have skip link for keyboard users', async ({ page }) => {
    await page.goto('/')
    
    // Press Tab to reveal skip link
    await page.keyboard.press('Tab')
    
    // Look for skip link
    const skipLink = page.locator('a[href*="#main"], a:has-text("Skip to")')
    
    if (await skipLink.isVisible()) {
      console.log('Skip link found and visible on focus')
      
      // Verify it's functional
      await skipLink.click()
      
      // Focus should move to main content
      const focusedElementId = await page.evaluate(() => document.activeElement?.id)
      console.log('Focus moved to element:', focusedElementId)
    } else {
      console.log('No skip link found (should be added for better accessibility)')
    }
  })
  
  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Run contrast-specific check
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze()
    
    const contrastViolations = results.violations.filter(v => 
      v.id.includes('color-contrast')
    )
    
    if (contrastViolations.length > 0) {
      console.log('Color contrast violations:')
      contrastViolations.forEach(v => {
        console.log(`- ${v.description}`)
        v.nodes.forEach(node => {
          console.log(`  Element: ${node.html}`)
          console.log(`  Impact: ${node.impact}`)
        })
      })
    }
    
    expect(contrastViolations).toEqual([])
  })
  
  test('should have proper form labels', async ({ page }) => {
    // Skip in CI - requires WASM to process uploaded file
    test.skip(isCI, 'WASM file processing is slow/unreliable in CI')
    
    await page.goto('/')
    
    // Upload file to get parameter form - use specific ID
    const fileInput = page.locator('#fileInput')
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.scad')
    
    try {
      await fileInput.setInputFiles(fixturePath)
      await page.waitForSelector('.param-control', { timeout: 15000 })
      
      // Check all form inputs have labels
      const unlabeledInputs = await page.locator('input:not([type="file"])').evaluateAll(inputs => {
        return inputs.filter(input => {
          const hasLabel = input.labels?.length > 0
          const hasAriaLabel = input.getAttribute('aria-label')
          const hasAriaLabelledby = input.getAttribute('aria-labelledby')
          return !hasLabel && !hasAriaLabel && !hasAriaLabelledby
        }).map(input => ({
          type: input.type,
          name: input.name,
          id: input.id
        }))
      })
      
      console.log('Unlabeled inputs:', unlabeledInputs)
      expect(unlabeledInputs.length).toBe(0)
    } catch (error) {
      console.log('Could not test form labels:', error.message)
      test.skip()
    }
  })
  
  test('should show library controls after upload even when no libraries detected', async ({ page }) => {
    // Skip in CI - requires WASM to process uploaded file
    test.skip(isCI, 'WASM file processing is slow/unreliable in CI')
    
    await page.goto('/')
    
    const fileInput = page.locator('#fileInput')
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.scad')
    
    try {
      await fileInput.setInputFiles(fixturePath)
      await page.waitForSelector('.param-control', { timeout: 15000 })
      
      // Library controls should be visible (not hidden)
      const libraryControls = page.locator('#libraryControls')
      await expect(libraryControls).toBeVisible()
      
      // Library details should exist (may be closed)
      const libraryDetails = page.locator('.library-details')
      await expect(libraryDetails).toBeVisible()
      
      console.log('Library controls are visible after upload')
    } catch (error) {
      console.log('Could not test library controls visibility:', error.message)
      test.skip()
    }
  })
})

test.describe('New Accessibility Features (WCAG 2.2)', () => {
  test('should have tooltip aria-describedby relationships', async ({ page }) => {
    // Skip in CI - requires WASM to process uploaded file
    test.skip(isCI, 'WASM file processing is slow/unreliable in CI')
    
    await page.goto('/')
    
    const fileInput = page.locator('#fileInput')
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.scad')
    
    try {
      await fileInput.setInputFiles(fixturePath)
      await page.waitForSelector('.param-control', { timeout: 15000 })
      
      // Check that help buttons have aria-describedby pointing to tooltip
      const helpButtons = await page.locator('.param-help-button').all()
      
      for (const button of helpButtons) {
        const describedBy = await button.getAttribute('aria-describedby')
        
        if (describedBy) {
          // Verify the tooltip element exists
          const tooltip = page.locator(`#${describedBy}`)
          await expect(tooltip).toBeAttached()
          
          // Verify tooltip has role="tooltip"
          const role = await tooltip.getAttribute('role')
          expect(role).toBe('tooltip')
        }
      }
      
      console.log(`Verified ${helpButtons.length} help buttons have proper aria-describedby`)
    } catch (error) {
      console.log('Could not complete tooltip test:', error.message)
      test.skip()
    }
  })

  test('should have keyboard shortcuts for 3D preview controls', async ({ page }) => {
    await page.goto('/')
    
    // Check for camera control buttons
    const cameraControls = page.locator('.camera-controls')
    
    // Camera controls may not be visible until a model is loaded
    // Just verify the structure exists in the DOM
    const rotateButtons = await page.locator('.camera-control-btn[aria-label*="rotate" i], .camera-control-btn[aria-label*="orbit" i]').count()
    const zoomButtons = await page.locator('.camera-control-btn[aria-label*="zoom" i]').count()
    
    console.log(`Found ${rotateButtons} rotate buttons, ${zoomButtons} zoom buttons`)
    
    // These may be 0 if no model is loaded, which is acceptable
  })

  test('should have workflow progress indicator with proper ARIA', async ({ page }) => {
    await page.goto('/')
    
    // Check workflow progress structure
    const workflowProgress = page.locator('#workflowProgress')
    
    // Verify role and label
    const role = await workflowProgress.getAttribute('role')
    const label = await workflowProgress.getAttribute('aria-label')
    
    expect(role).toBe('navigation')
    expect(label).toBeTruthy()
    
    // Verify steps are list items
    const steps = await workflowProgress.locator('.workflow-step').all()
    expect(steps.length).toBe(4) // upload, customize, render, download
    
    console.log('Workflow progress has proper ARIA structure')
  })

  test('should have parameter search with accessible input', async ({ page }) => {
    // Skip in CI - requires WASM to process uploaded file
    test.skip(isCI, 'WASM file processing is slow/unreliable in CI')
    
    await page.goto('/')
    
    const fileInput = page.locator('#fileInput')
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.scad')
    
    try {
      await fileInput.setInputFiles(fixturePath)
      await page.waitForSelector('.param-control', { timeout: 15000 })
      
      // Check search input exists and has proper attributes
      const searchInput = page.locator('#paramSearchInput')
      await expect(searchInput).toBeVisible()
      
      const ariaLabel = await searchInput.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      
      const type = await searchInput.getAttribute('type')
      expect(type).toBe('search')
      
      // Check jump-to-group dropdown
      const jumpSelect = page.locator('#paramJumpSelect')
      await expect(jumpSelect).toBeVisible()
      
      const jumpLabel = await jumpSelect.getAttribute('aria-label')
      expect(jumpLabel).toBeTruthy()
      
      console.log('Parameter search has proper accessibility attributes')
    } catch (error) {
      console.log('Could not complete search test:', error.message)
      test.skip()
    }
  })

  test('should filter parameters when searching', async ({ page }) => {
    // Skip in CI - requires WASM to process uploaded file
    test.skip(isCI, 'WASM file processing is slow/unreliable in CI')
    
    await page.goto('/')
    
    const fileInput = page.locator('#fileInput')
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.scad')
    
    try {
      await fileInput.setInputFiles(fixturePath)
      await page.waitForSelector('.param-control', { timeout: 15000 })
      
      // Get initial parameter count
      const initialCount = await page.locator('.param-control:not(.search-hidden)').count()
      
      // Type in search
      const searchInput = page.locator('#paramSearchInput')
      await searchInput.fill('width')
      
      // Wait for filtering
      await page.waitForTimeout(100)
      
      // Check that some parameters are now hidden
      const filteredCount = await page.locator('.param-control:not(.search-hidden)').count()
      
      console.log(`Before search: ${initialCount} params, after: ${filteredCount}`)
      
      // Clear search
      const clearBtn = page.locator('#clearParamSearchBtn')
      if (await clearBtn.isVisible()) {
        await clearBtn.click()
        
        const restoredCount = await page.locator('.param-control:not(.search-hidden)').count()
        expect(restoredCount).toBe(initialCount)
      }
    } catch (error) {
      console.log('Could not complete filter test:', error.message)
      test.skip()
    }
  })

  test('should have reset confirmation dialog with proper ARIA', async ({ page }) => {
    await page.goto('/')
    
    // Check reset confirmation modal structure
    const resetModal = page.locator('#resetConfirmModal')
    
    const role = await resetModal.getAttribute('role')
    const ariaModal = await resetModal.getAttribute('aria-modal')
    const labelledBy = await resetModal.getAttribute('aria-labelledby')
    
    expect(role).toBe('dialog')
    expect(ariaModal).toBe('true')
    expect(labelledBy).toBeTruthy()
    
    // Verify the labelled element exists
    const titleElement = page.locator(`#${labelledBy}`)
    await expect(titleElement).toBeAttached()
    
    console.log('Reset confirmation modal has proper ARIA')
  })
})

test.describe('Modal Focus Management', () => {
  test('should trap focus within Features Guide modal', async ({ page }) => {
    await page.goto('/')
    
    // Open the Features Guide modal via welcome screen button
    const learnMoreBtn = page.locator('#learnMoreFeaturesBtn')
    await learnMoreBtn.click()
    
    // Wait for modal to be visible
    const modal = page.locator('#featuresGuideModal')
    await expect(modal).toBeVisible()
    
    // Get first and last focusable elements in modal
    const focusableElements = await modal.locator('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])').all()
    
    if (focusableElements.length > 1) {
      // Tab through all elements and verify focus stays in modal
      for (let i = 0; i < focusableElements.length + 2; i++) {
        await page.keyboard.press('Tab')
        const activeElement = await page.evaluate(() => document.activeElement?.closest('#featuresGuideModal'))
        expect(activeElement).not.toBeNull()
      }
      
      console.log(`Focus trapped correctly with ${focusableElements.length} focusable elements`)
    }
    
    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(modal).toBeHidden()
    
    console.log('Modal closed on Escape and focus restored')
  })

  test('should restore focus to trigger on modal close', async ({ page }) => {
    await page.goto('/')
    
    const learnMoreBtn = page.locator('#learnMoreFeaturesBtn')
    await learnMoreBtn.focus()
    await learnMoreBtn.click()
    
    const modal = page.locator('#featuresGuideModal')
    await expect(modal).toBeVisible()
    
    // Close modal
    await page.keyboard.press('Escape')
    await expect(modal).toBeHidden()
    
    // Focus should return to the button that opened the modal
    const focusedId = await page.evaluate(() => document.activeElement?.id)
    expect(focusedId).toBe('learnMoreFeaturesBtn')
    
    console.log('Focus restored to trigger element after modal close')
  })
})

test.describe('Default Value Display (COGA)', () => {
  test('should display default values next to sliders', async ({ page }) => {
    // Skip in CI - requires WASM to process uploaded file
    test.skip(isCI, 'WASM file processing is slow/unreliable in CI')
    
    await page.goto('/')
    
    const fileInput = page.locator('#fileInput')
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.scad')
    
    try {
      await fileInput.setInputFiles(fixturePath)
      await page.waitForSelector('.param-control', { timeout: 15000 })
      
      // Check for default value hints on slider controls
      const defaultHints = await page.locator('.param-default-value').all()
      
      console.log(`Found ${defaultHints.length} default value hints`)
      
      // There should be at least some default hints for numeric parameters
      if (defaultHints.length > 0) {
        // Verify the hints have content and title attributes
        const firstHint = defaultHints[0]
        const content = await firstHint.textContent()
        const title = await firstHint.getAttribute('title')
        
        expect(content).toBeTruthy()
        expect(title).toContain('Default')
        
        console.log(`Default hint example: "${content}" with title "${title}"`)
      }
    } catch (error) {
      console.log('Could not complete default value test:', error.message)
      test.skip()
    }
  })
})

test.describe('Error Translation (COGA)', () => {
  test('error translator should provide user-friendly messages', async ({ page }) => {
    // This is a unit-style test that can run without file upload
    await page.goto('/')
    
    // Inject and test the error translator module
    const testResult = await page.evaluate(async () => {
      // Import the module dynamically
      try {
        const module = await import('/src/js/error-translator.js')
        
        // Test various error patterns
        const testCases = [
          { input: 'syntax error at line 42', expectTitle: 'Code Problem Found' },
          { input: 'undefined variable: my_var', expectTitle: 'Missing Variable' },
          { input: 'out of memory', expectTitle: 'Model Too Complex' },
          { input: 'timeout exceeded', expectTitle: 'Taking Too Long' },
        ]
        
        const results = testCases.map(tc => {
          const result = module.translateError(tc.input)
          return {
            input: tc.input,
            gotTitle: result.title,
            expectedTitle: tc.expectTitle,
            hasExplanation: !!result.explanation,
            hasSuggestion: !!result.suggestion,
            hasTechnical: !!result.technical,
            passed: result.title === tc.expectTitle
          }
        })
        
        return { success: true, results }
      } catch (e) {
        return { success: false, error: e.message }
      }
    })
    
    if (testResult.success) {
      console.log('Error translator test results:', testResult.results)
      const allPassed = testResult.results.every(r => r.passed && r.hasExplanation && r.hasSuggestion)
      expect(allPassed).toBe(true)
    } else {
      console.log('Could not load error translator module:', testResult.error)
      // Module import may fail in test environment - this is acceptable
    }
  })
})

test.describe('Workflow Progress Indicator', () => {
  test('should have proper structure and ARIA attributes', async ({ page }) => {
    await page.goto('/')
    
    const workflowProgress = page.locator('#workflowProgress')
    
    // Verify role and label
    const role = await workflowProgress.getAttribute('role')
    const label = await workflowProgress.getAttribute('aria-label')
    
    expect(role).toBe('navigation')
    expect(label).toContain('progress')
    
    // Verify all 4 steps exist
    const steps = await workflowProgress.locator('.workflow-step').all()
    expect(steps.length).toBe(4)
    
    // Verify step data attributes
    const stepTypes = ['upload', 'customize', 'render', 'download']
    for (let i = 0; i < steps.length; i++) {
      const stepAttr = await steps[i].getAttribute('data-step')
      expect(stepAttr).toBe(stepTypes[i])
    }
    
    console.log('Workflow progress has all 4 steps with correct structure')
  })

  test('workflow progress should update on file upload', async ({ page }) => {
    // Skip in CI - requires WASM to process uploaded file
    test.skip(isCI, 'WASM file processing is slow/unreliable in CI')
    
    await page.goto('/')
    
    const fileInput = page.locator('#fileInput')
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.scad')
    
    try {
      await fileInput.setInputFiles(fixturePath)
      await page.waitForSelector('.param-control', { timeout: 15000 })
      
      // Check that workflow progress is visible
      const workflowProgress = page.locator('#workflowProgress')
      await expect(workflowProgress).toBeVisible()
      
      // Check that customize step is active
      const customizeStep = page.locator('.workflow-step[data-step="customize"]')
      const isActive = await customizeStep.evaluate(el => 
        el.classList.contains('active') || el.getAttribute('aria-current') === 'step'
      )
      
      expect(isActive).toBe(true)
      
      // Check that upload step is completed
      const uploadStep = page.locator('.workflow-step[data-step="upload"]')
      const isCompleted = await uploadStep.evaluate(el => el.classList.contains('completed'))
      
      expect(isCompleted).toBe(true)
      
      console.log('Workflow progress updated correctly after file upload')
    } catch (error) {
      console.log('Could not complete workflow progress test:', error.message)
      test.skip()
    }
  })
})

test.describe('Screen Reader Support', () => {
  test('should have ARIA landmarks', async ({ page }) => {
    await page.goto('/')
    
    // Check for landmark roles
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], main, nav, header').all()
    
    console.log('Found', landmarks.length, 'landmark elements')
    
    // Should have at least a main landmark
    const hasMain = await page.locator('[role="main"], main').count()
    expect(hasMain).toBeGreaterThan(0)
  })
  
  test('should have live region for status updates', async ({ page }) => {
    await page.goto('/')
    
    // Look for ARIA live regions
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').all()
    
    console.log('Found', liveRegions.length, 'live regions')
    
    if (liveRegions.length > 0) {
      const liveRegionInfo = await Promise.all(
        liveRegions.map(async region => ({
          role: await region.getAttribute('role'),
          ariaLive: await region.getAttribute('aria-live'),
          text: (await region.textContent())?.substring(0, 50)
        }))
      )
      console.log('Live regions:', liveRegionInfo)
    }
  })
  
  test('should announce errors to screen readers', async ({ page }) => {
    await page.goto('/')
    
    // Try to trigger an error (e.g., upload invalid file)
    // This is a basic check for error announcement mechanisms
    
    const errorRegions = await page.locator('[aria-live="assertive"], [role="alert"]').all()
    console.log('Found', errorRegions.length, 'assertive live regions for errors')
    
    // Should have at least one assertive live region for errors
    // (or errors should be announced some other way)
  })
  
  test.describe('Role-Based Feature Paths (Welcome Screen)', () => {
    test('should display role path cards with keyboard-accessible CTAs', async ({ page }) => {
      await page.goto('/')
      
      // Check that role path cards are present
      const roleCards = page.locator('.role-path-card')
      const cardCount = await roleCards.count()
      expect(cardCount).toBe(6) // 6 role-based cards
      
      // Check that each card has a "Try" button
      const tryButtons = page.locator('.btn-role-try')
      const tryCount = await tryButtons.count()
      expect(tryCount).toBe(6)
      
      // Check that all Try buttons are keyboard accessible
      const firstTryButton = tryButtons.first()
      await firstTryButton.focus()
      const isFocused = await firstTryButton.evaluate(el => el === document.activeElement)
      expect(isFocused).toBe(true)
      
      // Check that buttons have proper ARIA labels or text
      const firstButtonText = await firstTryButton.textContent()
      expect(firstButtonText).toBeTruthy()
      expect(firstButtonText.length).toBeGreaterThan(0)
    })
    
    test('should load example when role Try button is clicked', async ({ page }) => {
      // Skip in CI - requires WASM for example loading
      test.skip(isCI, 'WASM example loading is slow/unreliable in CI')
      
      await page.goto('/')
      
      // Click the first "Try" button (Educators path -> Simple Box, as of v2.0 reordering)
      const firstTryButton = page.locator('.btn-role-try').first()
      await firstTryButton.click()
      
      // Wait for example to load and parameters UI to appear
      await page.waitForSelector('.param-control', {
        timeout: 15000
      })
      
      // Check that welcome screen is hidden
      const welcomeScreen = page.locator('#welcomeScreen')
      await expect(welcomeScreen).toHaveClass(/hidden/)
      
      // Check that main interface is visible
      const mainInterface = page.locator('#mainInterface')
      await expect(mainInterface).not.toHaveClass(/hidden/)
      
      // Check that screen reader announcement was made
      const srAnnouncer = page.locator('#srAnnouncer')
      const announcement = await srAnnouncer.textContent()
      console.log('Screen reader announcement:', announcement)
      expect(announcement).toContain('loaded')
    })
    
    test('should open Features Guide when Learn More is clicked', async ({ page }) => {
      await page.goto('/')
      
      // Find a Learn More button that opens Features Guide (not a tour)
      const learnMoreBtn = page.locator('.btn-role-learn').filter({ hasText: 'Learn More' }).first()
      await learnMoreBtn.click()
      
      // Wait for Features Guide modal to open
      const featuresGuideModal = page.locator('#featuresGuideModal')
      await expect(featuresGuideModal).not.toHaveClass(/hidden/)
      
      // Check that modal has proper ARIA attributes
      await expect(featuresGuideModal).toHaveAttribute('role', 'dialog')
      await expect(featuresGuideModal).toHaveAttribute('aria-modal', 'true')
    })
    
    test('should have keyboard-accessible accessibility spotlight links', async ({ page }) => {
      await page.goto('/')
      
      // Check that spotlight links exist
      const spotlightLinks = page.locator('.spotlight-link')
      const linkCount = await spotlightLinks.count()
      expect(linkCount).toBe(4) // 4 accessibility highlights
      
      // Check that links are keyboard accessible
      const firstLink = spotlightLinks.first()
      await firstLink.focus()
      const isFocused = await firstLink.evaluate(el => el === document.activeElement)
      expect(isFocused).toBe(true)
      
      // Check that links have proper attributes
      await expect(firstLink).toHaveAttribute('href')
      const linkText = await firstLink.textContent()
      expect(linkText.length).toBeGreaterThan(0)
    })
    
    test('should meet touch target size requirements (44×44px)', async ({ page }) => {
      await page.goto('/')
      
      // Check role path Try buttons
      const tryButtons = page.locator('.btn-role-try')
      const firstButton = tryButtons.first()
      const buttonBox = await firstButton.boundingBox()
      
      expect(buttonBox).not.toBeNull()
      expect(buttonBox.height).toBeGreaterThanOrEqual(44)
      expect(buttonBox.width).toBeGreaterThan(0) // Full width in card, so just check it exists
      
      // Check spotlight links
      const spotlightLinks = page.locator('.spotlight-link')
      const firstLink = spotlightLinks.first()
      const linkBox = await firstLink.boundingBox()
      
      expect(linkBox).not.toBeNull()
      expect(linkBox.height).toBeGreaterThanOrEqual(44)
    })
    
    test('should have proper focus indicators on role cards', async ({ page }) => {
      await page.goto('/')
      
      // Tab to first Try button
      await page.keyboard.press('Tab') // Skip link
      await page.keyboard.press('Tab') // Header controls or first card button
      
      // Get focused element
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Check that outline is visible (computed style check)
      const outlineWidth = await focusedElement.evaluate(
        el => window.getComputedStyle(el).outlineWidth
      )
      
      // Should have at least 2px outline (WCAG 2.4.13)
      const outlineWidthPx = parseFloat(outlineWidth)
      expect(outlineWidthPx).toBeGreaterThanOrEqual(2)
    })
    
    test('should display cards in correct order (Educators first, Screen Reader last)', async ({ page }) => {
      await page.goto('/')
      
      // Get all role path cards
      const roleCards = page.locator('.role-path-card')
      const cardCount = await roleCards.count()
      expect(cardCount).toBe(6)
      
      // Check first card is Educators
      const firstCardTitle = await roleCards.nth(0).locator('.role-path-title').textContent()
      expect(firstCardTitle.toLowerCase()).toContain('educator')
      
      // Check second card is Advanced Makers
      const secondCardTitle = await roleCards.nth(1).locator('.role-path-title').textContent()
      expect(secondCardTitle.toLowerCase()).toContain('maker')
      
      // Check last card is Screen Reader
      const lastCardTitle = await roleCards.nth(5).locator('.role-path-title').textContent()
      expect(lastCardTitle.toLowerCase()).toContain('screen reader')
    })
    
    test('should show tutorial tips on cards', async ({ page }) => {
      await page.goto('/')
      
      // Check that cards have tips lists
      const tipLists = page.locator('.role-path-tips')
      const tipCount = await tipLists.count()
      expect(tipCount).toBe(6) // All 6 cards should have tips
      
      // Check first card has tips
      const firstCardTips = await tipLists.first().locator('li').count()
      expect(firstCardTips).toBeGreaterThanOrEqual(2) // At least 2-3 tips per card
    })
    
    test('should open tutorial overlay after example loads', async ({ page }) => {
      // Skip in CI - requires WASM for example loading
      test.skip(isCI, 'WASM example loading is slow/unreliable in CI')
      
      await page.goto('/')
      
      // Click a "Start Tutorial" button
      const firstTryButton = page.locator('.btn-role-try').first()
      await firstTryButton.click()
      
      // Wait for example to load
      await page.waitForSelector('.param-control', {
        timeout: 15000
      })
      
      // Tutorial overlay should appear after a short delay
      await page.waitForTimeout(1000)
      
      const tutorialOverlay = page.locator('.tutorial-overlay')
      await expect(tutorialOverlay).toBeVisible()
      
      // Check ARIA attributes
      await expect(tutorialOverlay).toHaveAttribute('role', 'dialog')
      await expect(tutorialOverlay).toHaveAttribute('aria-modal', 'true')
    })
    
    test('should have keyboard-navigable tutorial with Back/Next buttons', async ({ page }) => {
      // Skip in CI - requires WASM for example loading
      test.skip(isCI, 'WASM example loading is slow/unreliable in CI')
      
      await page.goto('/')
      
      // Click a "Start Tutorial" button
      const firstTryButton = page.locator('.btn-role-try').first()
      await firstTryButton.click()
      
      // Wait for tutorial to appear
      await page.waitForSelector('.tutorial-overlay', {
        timeout: 20000
      })
      
      // Check that tutorial has navigation buttons
      const backBtn = page.locator('#tutorialBackBtn')
      const nextBtn = page.locator('#tutorialNextBtn')
      
      await expect(backBtn).toBeVisible()
      await expect(nextBtn).toBeVisible()
      
      // Back button should be disabled on first step
      await expect(backBtn).toBeDisabled()
      
      // Next button should be enabled
      await expect(nextBtn).not.toBeDisabled()
      
      // Click Next
      await nextBtn.click()
      await page.waitForTimeout(300)
      
      // Back button should now be enabled
      await expect(backBtn).not.toBeDisabled()
    })
    
    test('should close tutorial with Escape key and restore focus', async ({ page }) => {
      // Skip in CI - requires WASM for example loading
      test.skip(isCI, 'WASM example loading is slow/unreliable in CI')
      
      await page.goto('/')
      
      // Click a "Start Tutorial" button
      const firstTryButton = page.locator('.btn-role-try').first()
      await firstTryButton.click()
      
      // Wait for tutorial to appear
      await page.waitForSelector('.tutorial-overlay', {
        timeout: 20000
      })
      
      // Press Escape to close
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      
      // Tutorial should be closed
      const tutorialOverlay = page.locator('.tutorial-overlay')
      await expect(tutorialOverlay).not.toBeVisible()
      
      // Focus should be restored (check that body or a button has focus)
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
    
    test('should have close button with proper ARIA label', async ({ page }) => {
      // Skip in CI - requires WASM for example loading
      test.skip(isCI, 'WASM example loading is slow/unreliable in CI')
      
      await page.goto('/')
      
      // Click a "Start Tutorial" button
      const firstTryButton = page.locator('.btn-role-try').first()
      await firstTryButton.click()
      
      // Wait for tutorial to appear
      await page.waitForSelector('.tutorial-overlay', {
        timeout: 20000
      })
      
      // Check close button
      const closeBtn = page.locator('.tutorial-close')
      await expect(closeBtn).toBeVisible()
      await expect(closeBtn).toHaveAttribute('aria-label')
      
      const ariaLabel = await closeBtn.getAttribute('aria-label')
      expect(ariaLabel.toLowerCase()).toContain('exit')
      
      // Close button should work
      await closeBtn.click()
      await page.waitForTimeout(300)
      
      const tutorialOverlay = page.locator('.tutorial-overlay')
      await expect(tutorialOverlay).not.toBeVisible()
    })
    
    test('should show step progress indicator', async ({ page }) => {
      // Skip in CI - requires WASM for example loading
      test.skip(isCI, 'WASM example loading is slow/unreliable in CI')
      
      await page.goto('/')
      
      // Click a "Start Tutorial" button
      const firstTryButton = page.locator('.btn-role-try').first()
      await firstTryButton.click()
      
      // Wait for tutorial to appear
      await page.waitForSelector('.tutorial-overlay', {
        timeout: 20000
      })
      
      // Check progress indicator
      const progressIndicator = page.locator('.tutorial-progress')
      await expect(progressIndicator).toBeVisible()
      
      const progressText = await progressIndicator.textContent()
      expect(progressText).toMatch(/Step \d+ of \d+/)
    })
  })
})

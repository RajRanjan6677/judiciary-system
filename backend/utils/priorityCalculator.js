/**
 * Analyzes a case and its hearings to determine priority, complexity, and urgency.
 * @param {Object} caseObj - The Case document
 * @param {Array} hearings - Array of Hearing documents for this case
 * @returns {Object} Priority analytics data
 */
export const analyzeCasePriority = (caseObj, hearings) => {
    const now = new Date();
    const createdAt = new Date(caseObj.createdAt);
    
    // Calculate case age in days
    const caseAgeDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    const completedHearings = hearings.filter(h => new Date(h.date) <= now).length;
    
    // Sort hearings by date to find latest
    const sortedHearings = [...hearings].sort((a, b) => new Date(a.date) - new Date(b.date));
    const lastHearing = sortedHearings.filter(h => new Date(h.date) <= now).pop();
    const futureHearings = sortedHearings.filter(h => new Date(h.date) > now);
    
    // Find the current scheduled next hearing date
    let currentNextHearingDate = null;
    if (futureHearings.length > 0) {
        currentNextHearingDate = futureHearings[0].date;
    } else if (lastHearing && lastHearing.nextHearingDate) {
        currentNextHearingDate = lastHearing.nextHearingDate;
    }

    let priority = "Low";
    let complexity = "Simple";
    let urgencyScore = 0;
    let reasons = [];

    // 1. Complexity Logic
    if (completedHearings > 5) {
        complexity = "Complex";
        urgencyScore += 20;
    } else if (completedHearings > 2) {
        complexity = "Moderate";
        urgencyScore += 10;
    }

    // 2. Priority Logic Based on Category
    const highPriorityCategories = ["UAPA", "Rape", "POCSO", "Murder"];
    if (highPriorityCategories.includes(caseObj.caseCategory)) {
        priority = "High";
        urgencyScore += 50;
        reasons.push(`High priority category (${caseObj.caseCategory})`);
    } else if (caseObj.caseCategory === "Criminal") {
        priority = priority === "High" ? "High" : "Medium";
        urgencyScore += 25;
    } else if (["Civil", "Property", "Family"].includes(caseObj.caseCategory)) {
        if (priority !== "High") priority = "Low";
        urgencyScore += 10;
    }

    // 3. Age Logic
    if (caseAgeDays > 180) {
        priority = "High";
        urgencyScore += 40;
        reasons.push("Pending > 180 days");
    } else if (caseAgeDays > 90) {
        if (priority === "Low") priority = "Medium";
        urgencyScore += 20;
    }

    // 4. Scheduling Logic
    if (!currentNextHearingDate) {
        priority = "High";
        urgencyScore += 30;
        reasons.push("No next hearing date scheduled");
    }

    // Determine suggested next hearing date
    let suggestedDays = 30; // Default Low
    if (priority === "High") {
        suggestedDays = 7;
    } else if (priority === "Medium") {
        suggestedDays = 15;
    }

    const suggestedNextHearingDate = new Date();
    suggestedNextHearingDate.setDate(now.getDate() + suggestedDays);

    return {
        caseId: caseObj._id,
        caseNumber: caseObj.caseNumber,
        title: caseObj.title,
        description: caseObj.description,
        status: caseObj.status,
        caseCategory: caseObj.caseCategory,
        caseAgeDays,
        completedHearings,
        priority,
        complexity,
        urgencyScore,
        reason: reasons.join(", ") || "Standard processing",
        lastHearingDate: lastHearing ? lastHearing.date : null,
        currentNextHearingDate,
        suggestedNextHearingDate,
        assignedJudge: caseObj.judgeId,
        assignedLawyer: caseObj.lawyerId
    };
};

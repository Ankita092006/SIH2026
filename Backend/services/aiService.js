const generateRecommendation = async (result) => {

    if (result.score < 50) {
        return "Try an easy memory game next.";
    }

    if (result.score >= 80) {
        return "Good performance. Try a slightly more challenging game.";
    }

    return "Continue practicing memory activities.";
};

module.exports = {
    generateRecommendation
};
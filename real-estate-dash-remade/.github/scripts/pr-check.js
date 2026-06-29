module.exports = async ({ github, context }) => {
  console.log("Starting PR template check");

  try {
    const pr = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.issue.number,
    });

    const body = pr.data.body || "";

    const technicalOverviewRegex =
      /## Technical Overview\s*(<!--[\s\S]*?-->)?\s*([\s\S]*?)(?=##|$)/;
    const match = body.match(technicalOverviewRegex);
    let hasTechnicalOverview = false;

    if (match) {
      const contentAfterComment = match[2]
        .replace(/<!--[\s\S]*?-->/g, "")
        .trim();
      hasTechnicalOverview = contentAfterComment.length > 0;
    }

    const isTestedLocally = body.includes(
      "- [x] I have tested my code locally.",
    );

    const cantTestLocally = body.includes(
      "- [x] N/A - I can't test my code locally.",
    );

    console.log(`Has Technical Overview: ${hasTechnicalOverview}`);
    console.log(`Is Tested Locally: ${isTestedLocally}`);
    console.log(`Can't test Locally: ${cantTestLocally}`);

    if (
      hasTechnicalOverview &&
      (isTestedLocally || cantTestLocally) &&
      !(isTestedLocally && cantTestLocally)
    ) {
      console.log("Requirements met, no action needed");
      return;
    }

    console.log("Requirements not met, adding comment");
    let comment = "Please consider these to help your PR get reviewed faster:";
    if (!hasTechnicalOverview) {
      comment += '\n- Adding more details to the "Technical Overview" section.';
    }
    if (!isTestedLocally && !cantTestLocally) {
      comment +=
        "\n- Testing your code locally, if applicable, and checking one of the boxes.";
    }
    if (isTestedLocally && cantTestLocally) {
      comment += "\n- Please only check one of the boxes.";
    }

    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: comment,
    });

    console.log("Comment added to PR");
  } catch (error) {
    console.error("Error occurred:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

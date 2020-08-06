import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  app.on(['issue_comment'], async (context: Context) => {

    const isTeacher = await isTeacherResponse(context);

    if (context.payload.comment && context.payload.comment.body && context.payload.comment.body.includes('/help-english')) {
      if (isTeacher) {
        await makeTeacherResponse(context, context.payload.comment.body);
      } else {
        await makeRevisionIssue(context, context.payload.comment.body);
      }
    } else if (context.payload.comment && context.payload.comment.body) {
      if (isTeacher) {
        await makeTeacherResponse(context, context.payload.comment.body);
      }
    }

  })

  app.on(['issues.opened'], async (context: Context) => {

    const isTeacher = await isTeacherResponse(context);


    if (context.payload.issue && context.payload.issue && context.payload.issue.body.includes('/help-english')) {
      if (isTeacher) {
        await makeTeacherResponse(context, context.payload.issue.body);
      } else {
        await makeRevisionIssue(context, context.payload.issue.body);
      }
    } else if (context.payload && context.payload.issue && context.payload.issue.body) {
      if (isTeacher) {
        await makeTeacherResponse(context, context.payload.issue.body);
      }
    }

  })
}

const makeTeacherResponse = async (context: Context, translatedText: string) => {

  const title = context.payload.issue.title;
  const { owner, repo } = context.repo();

  const issueNumber = title.substring(
    title.lastIndexOf("#") + 1,
    title.lastIndexOf(",")
  );

  await context.github.issues.createComment({ owner: owner, repo: repo, issue_number: issueNumber, body: translatedText });
  await context.github.issues.addLabels({ owner: owner, repo: repo, issue_number: issueNumber, labels: ['revisioned'] });

}


const isTeacherResponse = async (context: Context) => {


  const retorno = await context.payload.issue.user.login === 'black-power-robot[bot]';

  return retorno;
}


const makeRevisionIssue = async (context: Context, text: string) => {
  const { owner, repo } = context.repo();
  const body = text.replace("/help-english", "");

  const issueCreated = await context.github.issues.create({ owner: owner, repo: repo, title: `Revision #${context.payload.issue.number}, please!`, body: body });

  await context.github.issues.addLabels({ owner: owner, repo: repo, issue_number: issueCreated.data.number, labels: ['englishRevision'] });

}
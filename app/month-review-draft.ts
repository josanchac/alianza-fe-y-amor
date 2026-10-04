import {useEffect,useRef,useState} from 'react';
import {readMonthlyReview} from '@/lib/monthly-review';
import type {RecordItem} from '@/lib/domain';

type MonthlyReviewDraft={answers:string[];baseline:string;version:number};
/** Journal owns this memory-only store; a new account or data epoch gets a new store. */
export type MonthlyReviewDrafts=Map<string,MonthlyReviewDraft>;
function changed(answers:string[],baseline:string){
  const original=readMonthlyReview(baseline).answers;
  return answers.some((answer,index)=>answer!==original[index]);
}

/** Purpose and monthly answers share a versioned record. Rebase only when safe. */
export function useMonthlyReviewDraft(record:RecordItem|undefined,drafts?:MonthlyReviewDrafts,month='') {
  const text=record?.data.review??'';
  const version=record?.version??0;
  // Reuse the object when returning during an in-flight save. Its completion
  // must advance that same baseline without replacing newer draft text.
  const draft=useRef(drafts?.get(month)??{answers:readMonthlyReview(text).answers,baseline:text,version});
  const [answers,setAnswers]=useState<string[]>(()=>draft.current.answers);

  function remember(){
    if(!drafts)return;
    if(changed(draft.current.answers,draft.current.baseline))drafts.set(month,draft.current);
    else drafts.delete(month);
  }

  useEffect(()=>{
    const dirty=changed(answers,draft.current.baseline);
    // Another editor on this phone can change the purpose without changing answers.
    // If the answers changed elsewhere too, preserve the draft and its old version:
    // the existing server-side conflict check must still reject an overwrite.
    if(version>draft.current.version&&(text===draft.current.baseline||!dirty)){
      if(!dirty)setAnswers(readMonthlyReview(text).answers);
      draft.current.version=version;
      draft.current.baseline=text;
    }
    draft.current.answers=answers;
    remember();
  },[text,version,answers,drafts,month]);

  function markSaved(review:string,savedVersion:number){
    draft.current.baseline=review;
    draft.current.version=savedVersion;
    // Text typed while the request was pending is still an unsaved draft.
    remember();
  }
  return {answers,setAnswers,reviewVersion:{get current(){return draft.current.version;}},markSaved};
}

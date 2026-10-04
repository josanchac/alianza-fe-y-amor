import {useEffect,useRef,useState} from 'react';
import {readMonthlyReview} from '@/lib/monthly-review';
import type {RecordItem} from '@/lib/domain';

/** Purpose and monthly answers share a versioned record. Rebase only when safe. */
export function useMonthlyReviewDraft(record:RecordItem|undefined) {
  const text=record?.data.review??'';
  const version=record?.version??0;
  const [answers,setAnswers]=useState<string[]>(()=>readMonthlyReview(text).answers);
  const reviewVersion=useRef(version);
  const baseline=useRef(text);

  useEffect(()=>{
    if(version===reviewVersion.current)return;
    const original=readMonthlyReview(baseline.current).answers;
    const dirty=answers.some((answer,index)=>answer!==original[index]);
    // Another editor on this phone can change the purpose without changing answers.
    // If the answers changed elsewhere too, preserve the draft and its old version:
    // the existing server-side conflict check must still reject an overwrite.
    if(text===baseline.current||!dirty){
      if(!dirty)setAnswers(readMonthlyReview(text).answers);
      reviewVersion.current=version;
      baseline.current=text;
    }
  },[text,version,answers]);

  function markSaved(review:string,savedVersion:number){
    baseline.current=review;
    reviewVersion.current=savedVersion;
  }
  return {answers,setAnswers,reviewVersion,markSaved};
}

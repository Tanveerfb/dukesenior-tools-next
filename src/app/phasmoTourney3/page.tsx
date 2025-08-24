import { redirect } from 'next/navigation';

export default function PhasmoTourney3Page(){
  // Redirect legacy bracket route to new grouped unified bracket
  redirect('/phasmoTourney3Group/t3');
}


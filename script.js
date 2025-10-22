document.addEventListener('DOMContentLoaded', () => {
  const folders = document.querySelectorAll('.folder');
  const inventory = document.getElementById('inventory');
  const progress = document.getElementById('progress');
  const openReport = document.getElementById('openReport');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalControls = document.getElementById('modalControls');
  const modalFeedback = document.getElementById('modalFeedback');
  const closeModalBtn = document.getElementById('closeModal');

  let unlocked = new Set();

  function openModal(title, bodyHtml, controlsBuilder) {
    modalTitle.textContent = title;
    if (typeof bodyHtml === 'string') modalBody.innerHTML = bodyHtml;
    else modalBody.innerHTML = ''; modalBody.appendChild(bodyHtml);
    modalControls.innerHTML = '';
    if (controlsBuilder) controlsBuilder(modalControls);
    modalFeedback.textContent = '';
    modal.classList.remove('hidden');
  }

  function closeModalFunc() { modal.classList.add('hidden'); }
  closeModalBtn.addEventListener('click', closeModalFunc);

  function markUnlocked(caseNum, title, clue) {
    if (unlocked.has(caseNum)) return;
    unlocked.add(caseNum);
    const li = document.createElement('li');
    li.textContent = `${title}: ${clue}`;
    inventory.appendChild(li);
    progress.value = unlocked.size;
    const folder = document.getElementById('folder'+(caseNum+1));
    if(folder) folder.classList.remove('locked');
    if(unlocked.size===4) openReport.disabled=false;
  }

  // Case 1: Fill-in-the-blank
  document.getElementById('folder1').addEventListener('click', () => {
    const body = document.createElement('div');
    body.innerHTML = `<div class="excerpt">"Do you think you could maybe <strong>_____</strong> drinking?" (Walls 116)</div>
    <p>Complete the missing word (one word):</p>`;
    const input = document.createElement('input');
    input.type='text';
    input.placeholder='one-word answer';
    body.appendChild(input);

    openModal('Case 1 — Sobriety', body, controls=>{
      const btn=document.createElement('button'); btn.textContent='Submit';
      btn.addEventListener('click', ()=>{
        const val=(input.value||'').trim().toLowerCase();
        if(val==='stop'||val==='quit'){
          modalFeedback.style.color='green';
          modalFeedback.textContent='Correct!';
          markUnlocked(1,'Sobriety','Answer: '+val);
          setTimeout(closeModalFunc,800);
        } else {
          modalFeedback.style.color='#b83b3b';
          modalFeedback.textContent='Try again.';
        }
      });
      controls.appendChild(btn);
    });
  });

  // Case 2: Click-for-letters
  document.getElementById('folder2').addEventListener('click', ()=>{
    const body=document.createElement('div');
    body.innerHTML=`<div class="excerpt">"He was going to hire a <span class="clue-word" data-letter="D">truck</span> to <span class="clue-word" data-letter="U">cart</span> the <span class="clue-word" data-letter="M">garbage</span> to the <span class="clue-word" data-letter="P">dump</span> all at once." (Walls 155)</div>
    <div>Collected letters: <span id="collected2"></span></div>`;
    openModal('Case 2 — Trash Pit', body, controls=>{
      const submit=document.createElement('button'); submit.textContent='Submit Code';
      submit.addEventListener('click', ()=>{
        const code=(document.getElementById('collected2').textContent||'').toUpperCase();
        if(code==='DUMP'){ modalFeedback.style.color='green'; modalFeedback.textContent='Correct!'; markUnlocked(2,'Trash Pit','Code: DUMP'); setTimeout(closeModalFunc,800);}
        else {modalFeedback.style.color='#b83b3b'; modalFeedback.textContent='Incorrect.';}
      });
      controls.appendChild(submit);
      Array.from(document.querySelectorAll('.clue-word')).forEach(span=>{
        span.addEventListener('click', ()=>{
          if(!span.classList.contains('revealed')){
            span.classList.add('revealed');
            const collected=document.getElementById('collected2');
            collected.textContent=(collected.textContent||'')+span.dataset.letter;
          }
        });
      });
    });
  });

  // Case 3: Drag-and-drop simplified to reorder buttons
  document.getElementById('folder3').addEventListener('click', ()=>{
    const pieces=['When I left the house the next morning,','Dad was still asleep.','When I came home in the evening,','he was gone'];
    const shuffled=[...pieces].sort(()=>Math.random()-0.5);
    const body=document.createElement('div');
    body.innerHTML='<p>Click in chronological order:</p>';
    const container=document.createElement('div'); container.style.display='flex'; container.style.flexDirection='column'; container.style.gap='6px';
    shuffled.forEach(text=>{
      const btn=document.createElement('button'); btn.textContent=text;
      btn.addEventListener('click',()=>{
        const selected=document.createElement('div'); selected.textContent=text; selected.style.padding='4px'; container.appendChild(selected);
        btn.disabled=true;
      });
      container.appendChild(btn);
    });
    body.appendChild(container);
    openModal('Case 3 — Absence', body, controls=>{
      const check=document.createElement('button'); check.textContent='Check Order';
      check.addEventListener('click', ()=>{
        const selected=Array.from(container.children).map(n=>n.textContent);
        const correct=pieces.every((v,i)=>v===selected[i]);
        if(correct){ modalFeedback.style.color='green'; modalFeedback.textContent='Correct order!'; markUnlocked(3,'Absence','Key: GONE'); setTimeout(closeModalFunc,800);}
        else{modalFeedback.style.color='#b83b3b'; modalFeedback.textContent='Order incorrect.';}
      });
      controls.appendChild(check);
    });
  });

  // Case 4: MCQ
  document.getElementById('folder4').addEventListener('click', ()=>{
    const body=document.createElement('div');
    body.innerHTML=`<div class="excerpt">"'Gone, gone gone!' she said. 'It's all gone.'" (Walls 197)</div>
    <p>Interpretation of deception:</p>`;
    const ul=document.createElement('ul'); ul.className='mcq-options';
    const options=[
      {text:'Rose Mary hides money.',correct:false},
      {text:'Her priorities create a false scarcity.',correct:true},
      {text:'Neighbors stole the money.',correct:false},
      {text:'Children spent it secretly.',correct:false}
    ];
    options.forEach(opt=>{
      const li=document.createElement('li'); const btn=document.createElement('button'); btn.textContent=opt.text;
      btn.addEventListener('click', ()=>{
        if(opt.correct){ modalFeedback.style.color='green'; modalFeedback.textContent='Correct!'; markUnlocked(4,'Spending','Correct interpretation'); setTimeout(closeModalFunc,800);}
        else{modalFeedback.style.color='#b83b3b'; modalFeedback.textContent='Incorrect.';}
      });
      li.appendChild(btn); ul.appendChild(li);
    });
    body.appendChild(ul);
    openModal('Case 4 — Spending', body,null);
  });

  openReport.addEventListener('click', ()=>{
    const reportText=`Rationale — Deception as a Mechanism

Case 1: "Do you think you could maybe stop drinking?" (Walls 116)
Case 2: "He was going to hire a truck to cart the garbage to the dump all at once." (Walls 155)
Case 3: "When I left the house the next morning, Dad was still asleep. When I came home in the evening, he was gone." (Walls 170)
Case 4: "'Gone, gone gone!' she said. 'It's all gone.'" (Walls 197)

Deception is shown through broken promises, misleading explanations, absences, and misaligned priorities. Completing each puzzle encourages analytical reading of how deception shapes family life in The Glass Castle.`;
    openModal('Case Report — Deception', `<pre style="white-space:pre-wrap;">${reportText}</pre>`);
  });
});

(async () => {
  const sleep = async (delay) => new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
  const getVue = () => document.getElementById('app').__vue__;
  const getHeader = () => getVue().$children.find(c => c.$vnode.tag.includes('app-bar'));
  const getMain = () => getVue().$children.find(c => c.$vnode.tag.includes('v-main'));
  const goTo = async (area) => {
    const menu = getHeader().$children.find(c => c.$vnode.tag.includes('menu'));
    const features = menu.$children.find(c => c.$vnode.tag.includes('btn'));
    features.$el.dispatchEvent(new Event('mouseenter'));
    await sleep(100);
    menu.$children[1].$children[0].$children.find(c => c.$el.textContent.toLowerCase() === area.toLowerCase()).$el.click();
    await sleep(100);
  };

  /*** School ***/
  const getSchoolGame = () => {
    const school = getMain().$children.find(c => c.$vnode.tag.includes('school'));
    const game = school.$children.find(c => c.$vnode.tag.includes('minigame'));
    return game;
  };
  const goToQuestionaire = (subject, type) => {
    let subjectIndex = 0;
    let typeIndex = type.toLowerCase() !== 'study' ? 4 : 3;
    switch(subject.toLowerCase()) {
      case 'literature':
        subjectIndex = 1;
        break;
      case 'history':
        subjectIndex = 2;
    }
    const sujects = getMain().$children[0].$children[0].$children.filter(c => c.$vnode.tag.includes('subject'));
    sujects[subjectIndex].$el.querySelectorAll('button')[typeIndex].click();
  };
  const doSchoolAction = async (suject, type, solver, loop = true) => {
    try {
      await goTo('school');
      do {
        goToQuestionaire(suject, type);
        await sleep(1000);
        await solver();
        await sleep(1000);
      } while(loop);
    }
    catch {}
  };
  const doMath = async (type, loop = true) => {
    const answerQuestions = async () => new Promise((resolve) => {
      let handle = setInterval(() => {
        try {
          const game = getSchoolGame();
          game._data.answer = game._data.solution;
          game.$children.find(c => c.$vnode.tag.includes('btn')).$el.click();
        }
        catch (ex) {
          if (handle) {
            clearInterval(handle);
            handle = null;
          }
          return resolve();
        }
      }, 300);
    });
    await doSchoolAction('math', type, answerQuestions, loop);
  };
  const doLiterature = async (type, loop = true) => {
    const answerQuestions = async () => new Promise((resolve) => {
      let handle = setInterval(() => {
        try {
          const game = getSchoolGame();
          game._data.answer = game._data.words[0];
        }
        catch (ex) {
          if (handle) {
            clearInterval(handle);
            handle = null;
          }
          return resolve();
        }
      }, 300);
    });
    await doSchoolAction('literature', type, answerQuestions, loop);
  };
  const doHistory = async (type, loop = true) => {
    const answerQuestions = async () => new Promise((resolve) => {
      let handle = setInterval(() => {
        try {
          const game = getSchoolGame();
          if (game.answering) {
            game._data.answer = game.dates[game.question].year;
          }
          game.$children.find(c => c.$vnode.tag.includes('btn')).$el.click();
        }
        catch (ex) {
          if (handle) {
            clearInterval(handle);
            handle = null;
          }
          return resolve();
        }
      }, 300);
    });
    await doSchoolAction('history', type, answerQuestions, loop);
  };
  /*** End of School ***/
  
  window.onload = async () => {
    const container = document.createElement('div');
    const template = `
    <div>
      <i id="automations-toggle" class="v-icon notranslate mdi mdi-chevron-down theme--dark"></i>
      <span>Automations</span>
    </div>
    <div id="automations" class="v-card v-sheet theme--dark">
      <section>
        <div class="v-card__title pa-2 justify-center">
          <div>Horde</div>
        </div>
        <div class="pa-2">TBD</p>
      </section>
      <section>
        <div class="v-card__title pa-2 justify-center">
          <div>School</div>
        </div>
        <div class="pa-2">
          <button id="math-study" class="v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--small primary">
            <span class="v-btn__content">Math Study</span>
          </button>
          <button id="math-exam" class="v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--small primary">
            <span class="v-btn__content">Math Exam</span>
          </button>
        </div>
        <div class="pa-2">
          <button id="literature-study" class="v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--small primary">
            <span class="v-btn__content">Literature Study</span>
          </button>
          <button id="literature-exam" class="v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--small primary">
            <span class="v-btn__content">Literature Exam</span>
          </button>
        </div>
        <div class="pa-2">
          <button id="history-study" class="v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--small primary">
            <span class="v-btn__content">History Study</span>
          </button>
          <button id="history-exam" class="v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--small primary">
            <span class="v-btn__content">History Exam</span>
          </button>
        </div>
      </section>
    </div>
  `;
    container.innerHTML = template.trim();
    await sleep(500);
    getVue().$el.firstChild.appendChild(container);
    document.getElementById('math-study').addEventListener('click', async () => await doMath('study'));
    document.getElementById('math-exam').addEventListener('click', async () => await doMath('exam', false));
    document.getElementById('literature-study').addEventListener('click', async () => await doLiterature('study'));
    document.getElementById('literature-exam').addEventListener('click', async () => await doLiterature('exam', false));
    document.getElementById('history-study').addEventListener('click', async () => await doHistory('study'));
    document.getElementById('history-exam').addEventListener('click', async () => await doHistory('exam', false));
    const automations = document.getElementById('automations');
    document.getElementById('automations-toggle').addEventListener('click', function(e) {
      const isHidden = automations.classList.contains('d-none');
      isHidden ? automations.classList.remove('d-none') : automations.classList.add('d-none');
      e.target.classList.toggle('mdi-chevron-up', !isHidden);
      e.target.classList.toggle('mdi-chevron-down', isHidden);
    });
  };
})();
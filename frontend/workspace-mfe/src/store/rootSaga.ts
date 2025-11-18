import { all, fork } from 'redux-saga/effects';
import projectsSaga from './sagas/projectsSaga';
import tasksSaga from './sagas/tasksSaga';
import boardsSaga from './sagas/boardsSaga';
import workflowsSaga from './sagas/workflowsSaga';

export default function* rootSaga() {
  yield all([
    fork(projectsSaga),
    fork(tasksSaga),
    fork(boardsSaga),
    fork(workflowsSaga),
  ]);
}


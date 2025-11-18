import { all, fork } from 'redux-saga/effects';
import authSaga from './sagas/authSaga';
import uiSaga from './sagas/uiSaga';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(uiSaga)]);
}


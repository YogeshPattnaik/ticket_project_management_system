import { delay, put, takeEvery } from 'redux-saga/effects';
import { addNotification, removeNotification } from '../slices/uiSlice';

// Auto-remove notification after delay
function* autoRemoveNotificationSaga(
  action: ReturnType<typeof addNotification>
) {
  yield delay(5000); // 5 seconds
  yield put(removeNotification(action.payload.id));
}

export default function* uiSaga() {
  yield takeEvery('ui/addNotification', autoRemoveNotificationSaga);
}


import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCatsFetch, toggleVisible } from '../redux/features/cat/catSlice';

export default function ReduxSagaDemo() {
  const { cats, isLoading, isVisible } = useSelector((state) => state.cats);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCatsFetch());
  }, [dispatch]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Redux Saga Demo 🐱</h2>

      {/* Nút toggle isVisible */}
      <button
        onClick={() => dispatch(toggleVisible())}
        style={{
          marginBottom: 20,
          padding: '10px 20px',
          backgroundColor: isVisible ? '#4CAF50' : '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        {isVisible ? 'Ẩn danh sách mèo' : 'Hiện danh sách mèo'}
      </button>

      <p>Trạng thái hiện tại của isVisible: <strong>{isVisible.toString()}</strong></p>

      {isLoading && <p>Đang tải dữ liệu mèo...</p>}

      {/* Hiển thị danh sách mèo nếu isVisible = true */}
      {isVisible && !isLoading && (
        <ul>
          {cats.map((cat) => (
            <li key={cat.id}>{cat.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

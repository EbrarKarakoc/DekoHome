import React from 'react';
import ProtectedRoute from '../ProtectedRoute.jsx';

/**
 * Admin rotaları: yalnızca user.isAdmin === true ise çocukları gösterir;
 * değilse ana sayfaya yönlendirir (ProtectedRoute ile aynı mantık).
 */
export default function AdminProtectedRoute({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

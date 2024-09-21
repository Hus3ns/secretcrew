// src/components/Host/HostItem.js

import React from 'react';
import { useHost } from '../../contexts/HostContext';

const HostItem = ({ host }) => {
  const { deleteHost } = useHost();

  const handleDelete = () => {
    deleteHost(host.id);
  };

  return (
    <li>
      <p>{host.name}</p>
      <button onClick={handleDelete}>Delete</button>
    </li>
  );
};

export default HostItem;

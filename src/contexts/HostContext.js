import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const HostContext = createContext();

export const useHost = () => {
  return useContext(HostContext);
};

export const HostProvider = ({ children }) => {
  const [hosts, setHosts] = useState([]);
  const storage = getStorage();

  useEffect(() => {
    const fetchHosts = async () => {
      const hostCollection = collection(db, 'hosts');
      const hostSnapshot = await getDocs(hostCollection);
      const hostList = hostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHosts(hostList);
    };
    fetchHosts();
  }, []);

  const uploadFile = async (file, folder) => {
    const fileRef = ref(storage, `${folder}/${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const uploadFiles = async (files, folder) => {
    const uploadPromises = files.map(async (file) => {
      const url = await uploadFile(file, folder);
      return { name: file.name, url };
    });
    return Promise.all(uploadPromises);
  };

  const isUniqueIDNo = async (idNo, hostId = null) => {
    const q = query(collection(db, 'hosts'), where('idNo', '==', idNo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return true;
    if (hostId) {
      const hostDoc = querySnapshot.docs.find(doc => doc.id !== hostId);
      return !hostDoc;
    }
    return false;
  };

  const addHost = async (host) => {
    if (!(await isUniqueIDNo(host.idNo))) {
      throw new Error('ID No. must be unique.');
    }
    if (host.files.length) {
      host.files = await uploadFiles(host.files, 'hosts');
    }
    if (host.profilePicture) {
      host.profilePicture = await uploadFile(host.profilePicture, 'profile_pictures');
    }
    const docRef = await addDoc(collection(db, 'hosts'), host);
    setHosts([...hosts, { id: docRef.id, ...host }]);
  };

  const updateHost = async (id, updatedHost) => {
    if (!(await isUniqueIDNo(updatedHost.idNo, id))) {
      throw new Error('ID No. must be unique.');
    }
    if (updatedHost.files.length) {
      updatedHost.files = await uploadFiles(updatedHost.files, 'hosts');
    }
    if (updatedHost.profilePicture) {
      updatedHost.profilePicture = await uploadFile(updatedHost.profilePicture, 'profile_pictures');
    }
    const existingHost = hosts.find(host => host.id === id);
    if (!updatedHost.profilePicture) {
      updatedHost.profilePicture = existingHost.profilePicture;
    }
    const hostDoc = doc(db, 'hosts', id);
    await updateDoc(hostDoc, updatedHost);
    setHosts(hosts.map(host => (host.id === id ? { id, ...updatedHost } : host)));
  };

  const deleteHost = async (id) => {
    const hostDoc = doc(db, 'hosts', id);
    await deleteDoc(hostDoc);
    setHosts(hosts.filter(host => host.id !== id));
  };

  const deleteFile = async (fileUrl) => {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  };

  const addHostBulk = async (newHosts) => {
    const existingIDNos = new Set(hosts.map(host => host.idNo));
    for (let host of newHosts) {
      if (existingIDNos.has(host.idNo)) {
        throw new Error(`Duplicate ID No. found: ${host.idNo}`);
      }
      existingIDNos.add(host.idNo);
    }

    const formattedHosts = newHosts.map(host => ({
      name: host.name,
      category: host.category,
      idNo: host.idNo,
      position: host.position,
      nidPassportNumber: host.nidPassportNumber,
      wpVisaNumber: host.wpVisaNumber,
      gender: host.gender,
      country: host.country,
      status: host.status,
      files: [],
      zeyvaruPlus: host.zeyvaruPlus,
      klevio: host.klevio,
      hostDigitalId: host.hostDigitalId
    }));

    const docRefs = await Promise.all(formattedHosts.map(host => addDoc(collection(db, 'hosts'), host)));
    const addedHosts = docRefs.map((docRef, index) => ({ id: docRef.id, ...formattedHosts[index] }));
    setHosts([...hosts, ...addedHosts]);
  };

  const value = {
    hosts,
    addHost,
    updateHost,
    deleteHost,
    deleteFile,
    addHostBulk,
  };

  return (
    <HostContext.Provider value={value}>
      {children}
    </HostContext.Provider>
  );
};

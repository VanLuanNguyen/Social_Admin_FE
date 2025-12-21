'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { useUserManagement } from './management/hooks/useUserManagement';
import { useUserForm } from './management/hooks/useUserForm';
import UserFilters from './management/components/UserFilters';
import UserTable from './management/components/UserTable';
import PaginationControls from './management/components/PaginationControls';
import UserFormModal from './management/components/UserFormModal';

export default function UserManagementColumn() {
  const {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    pagination,
    displayRange,
    pageButtons,
    selectedUserId,
    setSelectedUserId,
    handleSearch,
    handlePageChange,
    handleToggleBanUser,
    fetchUsers,
  } = useUserManagement();

  const {
    isCreateModalOpen,
    isCreating,
    isEditMode,
    formData,
    setFormData,
    formErrors,
    handleCloseModal,
    openCreateModal,
    openEditModal,
    handleSubmit,
  } = useUserForm(() => {
    fetchUsers(pagination?.currentPage || 1);
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(pagination?.currentPage || 1);
  };

  return (
    <section className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl flex flex-col">
      <div className="p-6 border-b border-slate-700/50 flex flex-wrap items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold text-white mt-1">Quản lý người dùng</h2>
        <Button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500 border border-blue-400/30 shadow-lg shadow-blue-500/25"
        >
          + Thêm người dùng mới
        </Button>
      </div>

      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <UserTable
          users={users}
          loading={loading}
          searchQuery={searchQuery}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          onEditUser={openEditModal}
          onToggleBanUser={handleToggleBanUser}
        />

        <PaginationControls
          pagination={pagination}
          displayRange={displayRange}
          pageButtons={pageButtons}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </div>

      <UserFormModal
        isOpen={isCreateModalOpen}
        isEditMode={isEditMode}
        isCreating={isCreating}
        formData={formData}
        formErrors={formErrors}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        onFormDataChange={setFormData}
      />
    </section>
  );
}

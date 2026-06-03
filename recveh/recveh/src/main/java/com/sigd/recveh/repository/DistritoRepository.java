package com.sigd.recveh.repository;

import com.sigd.recveh.entity.Distrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DistritoRepository extends JpaRepository<Distrito, UUID> {
    List<Distrito> findAllByOrderByNombreAsc();
}
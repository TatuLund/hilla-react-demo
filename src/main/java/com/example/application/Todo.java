package com.example.application;

import java.time.LocalDate;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.validation.constraints.Future;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Entity 
public class Todo extends AbstractEntity {

  private boolean done = false;

  @NotBlank
  @NotNull
  private String task;

  @NotBlank
  private String description;

  @Max(5)
  @Min(1)
  private Integer priority;

  @Future
  private LocalDate deadline;

  @ManyToOne
  private Contact assigned;

  public Todo() {}

  public Todo(String task) {
    this.task = task;
  }

  public boolean isDone() {
    return done;
  }

  public void setDone(boolean done) {
    this.done = done;
  }

  public String getTask() {
    return task;
  }

  public void setTask(String task) {
    this.task = task;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Integer getPriority() {
    return priority;
  }

  public void setPriority(Integer priority) {
    this.priority = priority;
  }

  public LocalDate getDeadline() {
    return deadline;
  }

  public void setDeadline(LocalDate deadline) {
    this.deadline = deadline;
  }

  public Contact getAssigned() {
    return assigned;
  }

  public void setAssigned(Contact assigned) {
    this.assigned = assigned;
  }
}
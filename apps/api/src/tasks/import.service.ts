import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, Priority } from '@prisma/client';

@Injectable()
export class ImportService {
    constructor(private prisma: PrismaService) { }

    async importFromFile(file: Express.Multer.File, tenantId: string, userId: string) {
        const content = file.buffer.toString('utf-8');
        let tasks: any[] = [];

        if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
            try {
                const json = JSON.parse(content);
                tasks = Array.isArray(json) ? json : [json];
            } catch (e) {
                throw new Error('Invalid JSON format');
            }
        } else if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            try {
                tasks = this.parseCSV(content);
            } catch (e) {
                throw new Error('Invalid CSV format');
            }
        } else {
            throw new Error('Unsupported file format. Please upload JSON or CSV.');
        }

        const createdTasks = [];
        for (const rawTask of tasks) {
            // Smart mapping
            const taskData = {
                title: rawTask.title || rawTask.name || rawTask.Subject || 'Untitled Task',
                description: rawTask.description || rawTask.Description || rawTask.Notes || '',
                status: this.mapStatus(rawTask.status || rawTask.Status || rawTask.State),
                priority: this.mapPriority(rawTask.priority || rawTask.Priority),
                tenantId,
                createdById: userId,
                spentTime: parseFloat(rawTask.spentTime || rawTask.Hours || '0') || 0,
                dueDate: this.parseDate(rawTask.dueDate || rawTask['Due Date'] || rawTask.Deadline),
            };

            // Try to find assignee by email if provided
            const assigneeEmail = rawTask.assigneeEmail || rawTask['Assignee Email'] || rawTask.Assignee;
            let assigneeConnect = undefined;
            if (assigneeEmail) {
                const user = await this.prisma.user.findFirst({
                    where: { email: assigneeEmail, tenantId }
                });
                if (user) {
                    assigneeConnect = { connect: [{ id: user.id }] };
                }
            }

            const created = await this.prisma.task.create({
                data: {
                    ...taskData,
                    assignees: assigneeConnect,
                }
            });
            createdTasks.push(created);
        }

        return {
            success: true,
            count: createdTasks.length,
            message: `Successfully imported ${createdTasks.length} tasks.`,
        };
    }

    private parseCSV(content: string): any[] {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj: any = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            result.push(obj);
        }

        return result;
    }

    private mapStatus(status: string): TaskStatus {
        if (!status) return TaskStatus.NEW;
        const s = status.toUpperCase();
        if (s.includes('PROGRESS') || s.includes('WIP')) return TaskStatus.IN_PROGRESS;
        if (s.includes('REVIEW') || s.includes('CHECK')) return TaskStatus.REVIEW;
        if (s.includes('DONE') || s.includes('COMPLETE') || s.includes('CLOSED')) return TaskStatus.DONE;
        return TaskStatus.NEW;
    }

    private mapPriority(priority: string): Priority {
        if (!priority) return Priority.MEDIUM;
        const p = priority.toUpperCase();
        if (p.includes('HIGH') || p.includes('URGENT')) return Priority.HIGH;
        if (p.includes('LOW')) return Priority.LOW;
        return Priority.MEDIUM;
    }

    private parseDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    }
}
